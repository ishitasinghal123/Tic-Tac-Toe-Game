from flask import Flask, request, jsonify
from flask_cors import CORS
from minmax import get_best_move

app = Flask(__name__)
CORS(app)

@app.route('/computer_move', methods=['POST'])
def computer_move():
    data = request.get_json()
    board_2d = data['board']  # 3x3 list from frontend
    flat_board = [cell if cell in ['X', 'O'] else ' ' for row in board_2d for cell in row]

    best = get_best_move(flat_board)

    if best == -1:
        return jsonify({'move': None})  # game over

    row = best // 3
    col = best % 3
    return jsonify({'move': [row, col]})

if __name__ == '__main__':
    app.run(debug=True)
