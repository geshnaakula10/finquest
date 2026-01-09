"""
Flask backend application for managing players with Supabase integration.
"""
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Dict, Any, Optional
import uuid

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Initialize Supabase client
# Read Supabase URL and SERVICE_ROLE_KEY from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SERVICE_ROLE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def recalculate_leaderboard_positions() -> None:
    """
    Recalculate leaderboard positions for all players based on XP.
    Players are ranked by XP in descending order.
    """
    try:
        # Fetch all players ordered by XP descending
        response = supabase.table('players').select('id').order('xp', desc=True).execute()
        
        # Update each player's leaderboard_position based on their rank
        for index, player in enumerate(response.data, start=1):
            supabase.table('players').update({'leaderboard_position': index}).eq('id', player['id']).execute()
    except Exception as e:
        print(f"Error recalculating leaderboard positions: {str(e)}")
        raise


@app.route('/players', methods=['POST'])
def create_player():
    """
    Create a new player.
    Request body: name, email, character
    xp starts at 0, leaderboard_position can be null initially
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        name = data.get('name')
        email = data.get('email')
        character = data.get('character')
        
        if not name or not email:
            return jsonify({'error': 'name and email are required'}), 400
        
        # Generate UUID for the new player
        player_id = str(uuid.uuid4())
        
        # Create player record
        # xp defaults to 0, leaderboard_position can be null initially
        player_data = {
            'id': player_id,
            'name': name,
            'email': email,
            'character': character,
            'xp': 0,
            'leaderboard_position': None
        }
        
        # Insert into Supabase
        response = supabase.table('players').insert(player_data).execute()
        
        # Recalculate leaderboard positions after adding new player
        recalculate_leaderboard_positions()
        
        # Fetch the created player with updated leaderboard_position
        created_player = supabase.table('players').select('*').eq('id', player_id).execute()
        
        return jsonify(created_player.data[0]), 201
        
    except Exception as e:
        error_message = str(e)
        # Handle unique constraint violation (duplicate email)
        if 'duplicate key' in error_message.lower() or 'unique' in error_message.lower():
            return jsonify({'error': 'Email already exists'}), 409
        return jsonify({'error': f'Failed to create player: {error_message}'}), 500


@app.route('/players', methods=['GET'])
def get_all_players():
    """
    Return all players ordered by xp DESC (for leaderboard).
    """
    try:
        # Fetch all players ordered by XP descending
        response = supabase.table('players').select('*').order('xp', desc=True).execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch players: {str(e)}'}), 500


@app.route('/players/<player_id>', methods=['GET'])
def get_player(player_id: str):
    """
    Fetch a single player by id.
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(player_id)
        except ValueError:
            return jsonify({'error': 'Invalid player ID format'}), 400
        
        # Fetch player from Supabase
        response = supabase.table('players').select('*').eq('id', player_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Player not found'}), 404
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch player: {str(e)}'}), 500


@app.route('/players/<player_id>/xp', methods=['PUT'])
def update_player_xp(player_id: str):
    """
    Update player XP.
    Request body: xp_to_add (integer)
    Recalculate leaderboard_position after XP update.
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(player_id)
        except ValueError:
            return jsonify({'error': 'Invalid player ID format'}), 400
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        xp_to_add = data.get('xp_to_add')
        
        if xp_to_add is None:
            return jsonify({'error': 'xp_to_add is required'}), 400
        
        # Validate xp_to_add is an integer
        try:
            xp_to_add = int(xp_to_add)
        except (ValueError, TypeError):
            return jsonify({'error': 'xp_to_add must be an integer'}), 400
        
        # Fetch current player data
        current_player = supabase.table('players').select('xp').eq('id', player_id).execute()
        
        if not current_player.data:
            return jsonify({'error': 'Player not found'}), 404
        
        # Calculate new XP
        current_xp = current_player.data[0]['xp']
        new_xp = current_xp + xp_to_add
        
        # Ensure XP doesn't go below 0
        new_xp = max(0, new_xp)
        
        # Update player XP
        supabase.table('players').update({'xp': new_xp}).eq('id', player_id).execute()
        
        # Recalculate leaderboard positions after XP update
        recalculate_leaderboard_positions()
        
        # Fetch updated player data
        updated_player = supabase.table('players').select('*').eq('id', player_id).execute()
        
        return jsonify(updated_player.data[0]), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update player XP: {str(e)}'}), 500


@app.route('/players/<player_id>', methods=['DELETE'])
def delete_player(player_id: str):
    """
    Delete a player.
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(player_id)
        except ValueError:
            return jsonify({'error': 'Invalid player ID format'}), 400
        
        # Check if player exists
        existing_player = supabase.table('players').select('id').eq('id', player_id).execute()
        
        if not existing_player.data:
            return jsonify({'error': 'Player not found'}), 404
        
        # Delete player from Supabase
        supabase.table('players').delete().eq('id', player_id).execute()
        
        # Recalculate leaderboard positions after deletion
        recalculate_leaderboard_positions()
        
        return jsonify({'message': 'Player deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete player: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the server is running.
    """
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    # Run the Flask app
    # Default port is 5000, can be overridden with PORT environment variable
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
