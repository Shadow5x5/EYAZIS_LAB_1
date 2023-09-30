import "./App.css";
import Main from "./components/Main/Main.jsx";
import Text from "./components/Text/Text.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/text/:id" element={<Text />} />
            </Routes>
        </div>
    );
}

export default App;
