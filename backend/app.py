from flask import Flask, request, jsonify
from supabase import Client, create_client
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
supabase: Client = create_client(SUPABASE_URL, ANON_KEY)


@app.route("/")
def home():
    return "Flask + Supabase backend working ✅"

# ---------------- Signup ----------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    character = data.get("character")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # 1️⃣ Create user in Supabase Auth
        resp = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        user_id = resp.user.id

        # 2️⃣ Create profile manually
        supabase.table("profiles").insert({
            "id": user_id,      # IMPORTANT!
            "email": email,
            "username": username,
            "character": character,
            "xp": 0,
            "level": 1,
            "streak":1,
        }).execute()

        return jsonify({
            "message": "Signup successful",
            "user_id": user_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- Login ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        resp = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return jsonify({
            "message": "Login successful",
            "user_id": resp.user.id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- Get Profile ----------------
@app.route("/api/profile", methods=["GET"])
def profile():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    try:
        profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return jsonify(profile.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- Add XP ----------------
@app.route("/api/addxp/<int:xp>", methods=["POST"])
def add_xp(xp):
    user_id = supabase.auth.get_user()
    try:
        resp = supabase.table("profiles").select("xp").eq("id", user_id).single().execute()
        new_xp = resp.data["xp"] + xp

        supabase.table("profiles").update({
            "xp": new_xp
        }).eq("id", user_id).execute()

        return jsonify({"xp": new_xp}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- Change Level ----------------
@app.route("/api/changeLevel", methods=["POST"])
def change_level():
    user_id = supabase.auth.get_user()
    try:
        resp = supabase.table("profiles").select("level").eq("id", user_id).single().execute()
        new_level = resp.data["level"] + 1

        supabase.table("profiles").update({
            "level": new_level
        }).eq("id", user_id).execute()

        return jsonify({"level": new_level}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- Leaderboard ----------------
@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    try:
        data = supabase.table("profiles").select("username, xp, level").order("xp", desc=True).limit(10).execute()
        return jsonify(data.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)