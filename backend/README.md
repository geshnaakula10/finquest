# Flask Backend with Supabase

A Flask REST API backend that connects to Supabase for managing player data.

## Prerequisites

- Python 3.8 or higher
- A Supabase project with a `players` table

## Database Setup

Create a table named `players` in your Supabase database with the following SQL:

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  character TEXT,
  xp INTEGER DEFAULT 0,
  leaderboard_position INTEGER
);

-- Create an index on xp for faster leaderboard queries
CREATE INDEX idx_players_xp ON players(xp DESC);
```

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
   - `SERVICE_ROLE_KEY`: Your Supabase service role key (found in Project Settings > API)
   - `PORT`: Optional, defaults to 5000

## Running the Server

Start the Flask development server:

```bash
python app.py
```

Or use Flask's CLI:

```bash
flask run
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns server health status

### Create Player
- **POST** `/players`
  - Request body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "character": "explorer"
    }
    ```
  - Returns: Created player object with generated ID

### Get All Players
- **GET** `/players`
  - Returns: Array of all players ordered by XP (descending)

### Get Player by ID
- **GET** `/players/<id>`
  - Returns: Single player object

### Update Player XP
- **PUT** `/players/<id>/xp`
  - Request body:
    ```json
    {
      "xp_to_add": 100
    }
    ```
  - Automatically recalculates leaderboard positions after update
  - Returns: Updated player object

### Delete Player
- **DELETE** `/players/<id>`
  - Returns: Success message
  - Automatically recalculates leaderboard positions after deletion

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `409`: Conflict (e.g., duplicate email)
- `500`: Internal Server Error

All error responses are in JSON format:
```json
{
  "error": "Error message description"
}
```

## Notes

- The `leaderboard_position` is automatically recalculated whenever:
  - A new player is created
  - A player's XP is updated
  - A player is deleted
- XP cannot go below 0 (negative values are prevented)
- Email addresses must be unique
- All player IDs are UUIDs
