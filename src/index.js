import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const btnStyle = props.highlighted ? {backgroundColor: 'yellow'} : {};
  return (
    <button className="square" onClick={props.onClick} style={btnStyle}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const highlighted = this.props.winnerLine && this.props.winnerLine.includes(i);
    return (
      <Square 
        highlighted={highlighted}
        key={i} 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)} />        
    );
  }

  render() {
    return (
      <div>
        {Array(3).fill('').map((el, row) => 
          <div className="board-row" key={row}>
            {Array(3).fill('').map((el, col) => 
              this.renderSquare(3 * row + col)
            )}
          </div>
        )}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        moveLocation: '',
      }],
      xIsNext: true,
      stepNumber: 0,
      reversed: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const xIsNext = !this.state.xIsNext;
    squares[i] = this.state.xIsNext ? 'X' : '0';
    const moveLocation = `(${i % 3 + 1}, ${Math.floor(i / 3) + 1})`;
    this.setState({
      history: history.concat({squares, moveLocation}), 
      xIsNext, 
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const {xIsNext, history, stepNumber} = this.state;
    const current = history[stepNumber];
    const squares = current.squares;
    const winnerLine = calculateWinner(squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' ' + history[move].moveLocation:
        'Go to game start';
      const itemStyle = {fontWeight: move === stepNumber ? 'bold' : 'normal'};
      return (
        <li key={move} style={itemStyle}>
          <button onClick={() => this.jumpTo(move)}>
            <span style={itemStyle}>{desc}</span>
          </button>
        </li>
      );
    });
    if (this.state.reversed) {
      moves.reverse();
    }

    const isDraw = !winnerLine && squares.filter(s => s === null).length === 0;

    let status;
    if (winnerLine) {
      status = 'Winner: ' + squares[winnerLine[0]];
    } else if (isDraw) {
      status = `It's a draw`;
    } else {
      status = `Next player: ${xIsNext ? 'X' : '0'}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={squares} onClick={this.handleClick} winnerLine={winnerLine}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.setState(state => ({reversed: !state.reversed}))}>
            {this.state.reversed ? 'Reversed' : 'Normal'}
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return line;
    }
  }
  return null;
}