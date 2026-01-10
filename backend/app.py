from flask import Flask, request, jsonify
from supabase import Client, create_client
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins for API routes

SUPABASE_URL = "https://qrconluweljaofvfdxqm.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyY29ubHV3ZWxqYW9mdmZkeHFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk4NzM4NCwiZXhwIjoyMDgzNTYzMzg0fQ.k93smL9588CrYtJCsxaxke6rJbbb8q3pUZswPyjLEYg"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyY29ubHV3ZWxqYW9mdmZkeHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5ODczODQsImV4cCI6MjA4MzU2MzM4NH0.5MWw72E5OtQQ2eWYJaiunXFrMD4oJ3KhtwlQz4GyX2E"

# Use SERVICE_ROLE_KEY for admin operations (updating profiles)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


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
            "id": user_id,
            "email": email,
            "username": username,
            "character": character,
            "xp": 0,
            "level": 1,
            "streak": 1,
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
@app.route("/api/addxp", methods=["POST", "OPTIONS"])
def add_xp():
    # Handle preflight request
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.json
    user_id = data.get("user_id")
    xp_delta = data.get("xp", 0)
    
    print(f"[ADD XP] Received request: user_id={user_id}, xp_delta={xp_delta}")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        # Get current XP
        resp = supabase.table("profiles").select("xp").eq("id", user_id).execute()
        print(f"[ADD XP] Current profile query result: {resp}")
        
        if not resp.data or len(resp.data) == 0:
            print(f"[ADD XP] ERROR: No profile found for user_id {user_id}")
            return jsonify({"error": "Profile not found"}), 404
        
        current_xp = resp.data[0]["xp"] if resp.data[0]["xp"] is not None else 0
        new_xp = max(0, current_xp + xp_delta)
        
        print(f"[ADD XP] Updating: {current_xp} + {xp_delta} = {new_xp}")

        # Update XP in database with SERVICE_ROLE_KEY (bypasses RLS)
        update_resp = supabase.table("profiles").update({
            "xp": new_xp
        }).eq("id", user_id).execute()
        
        print(f"[ADD XP] Update response data: {update_resp.data}")
        print(f"[ADD XP] Update response count: {update_resp.count if hasattr(update_resp, 'count') else 'N/A'}")
        
        # Verify the update worked
        verify_resp = supabase.table("profiles").select("xp").eq("id", user_id).execute()
        actual_xp = verify_resp.data[0]["xp"] if verify_resp.data and len(verify_resp.data) > 0 else None
        print(f"[ADD XP] Verified XP in database: {actual_xp}")
        
        if actual_xp != new_xp:
            print(f"[ADD XP] WARNING: XP mismatch! Expected {new_xp}, got {actual_xp}")
            return jsonify({"error": "Failed to update XP - RLS policy may be blocking update"}), 500

        return jsonify({"xp": new_xp}), 200

    except Exception as e:
        print(f"[ADD XP] Error: {str(e)}")
        import traceback
        traceback.print_exc()
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
        # Get all profiles ordered by XP descending
        data = supabase.table("profiles").select("username, xp, level").order("xp", desc=True).limit(10).execute()
        
        # Add position to each entry
        leaderboard_data = []
        for index, profile in enumerate(data.data, start=1):
            leaderboard_data.append({
                "position": index,
                "username": profile["username"],
                "xp": profile["xp"],
                "level": profile["level"]
            })
        
        return jsonify(leaderboard_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)