import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import Input from "./component/Input";

function App() {
  const [score, setScores] = useState({});
  const [scores, setAllScores] = useState([]);
  const socket = useMemo(
    () => io("http://localhost:3000", { autoConnect: false }),
    [],
  );
  const sortedScores = [...scores].sort(
    (first, second) => Number(first.score) - Number(second.score),
  );

  function handleInput(event) {
    let { name, value } = event.target;
    let currentObj = { [name]: value };

    setScores((prev) => ({ ...prev, ...currentObj }));
  }

  function sendScores() {
    socket.emit("scores", score);
  }

  useEffect(() => {
    function handlePlayerScores(playerScores) {
      setAllScores(playerScores);
    }

    socket.on("playerScores", handlePlayerScores);
    socket.connect();

    return () => {
      socket.off("playerScores", handlePlayerScores);
      socket.disconnect();
    };
  }, [socket]);
  return (
    <>
      <h1>React Multiplayer Dashboard</h1>

      <Input
        name="name"
        placeholder="Enter your Name"
        handleInput={handleInput}
      />

      <Input
        name="score"
        placeholder="Enter your Score"
        handleInput={handleInput}
      />

      <button className="send-scores" onClick={sendScores}>
        Publish Score
      </button>

      {scores.length > 0 ? (
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>

            {sortedScores.map((score) => (
              <tr key={score.id}>
                <td>{score?.name}</td>
                <td>{score?.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <></>
      )}
    </>
  );
}

export default App;
