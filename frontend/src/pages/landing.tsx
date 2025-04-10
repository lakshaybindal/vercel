import { useState } from "react";
import axios from "axios";
import { CheckCircle, Loader2 } from "lucide-react";

function Landing() {
  const [repouri, seturi] = useState("");
  const [id, setid] = useState("");
  const [uploading, setuploading] = useState(false);
  const [deployed, setdeployed] = useState(false);
  const [statusStep, setStatusStep] = useState(0); // 0: Idle, 1: Received, 2: Deploying, 3: Deployed

  const statusLabels = ["Repo Received", "Deploying", "Deployed"];

  async function deploy() {
    setuploading(true);
    setStatusStep(1); // Repo Received

    try {
      const res = await axios.post("http://localhost:3000/deploy", {
        repoUri: repouri,
      });
      setid(res.data.id);
      setStatusStep(2); // Deploying

      const interval = setInterval(async () => {
        const response = await axios.get(
          `http://localhost:3000/status?id=${res.data.id}`
        );
        if (response.data.status === "deployed") {
          clearInterval(interval);
          setStatusStep(3); // Deployed
          setdeployed(true);
          setuploading(false);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setuploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Deploy Your App</h1>
        <input
          type="text"
          placeholder="https://github.com/your/repo"
          className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          onChange={(e) => seturi(e.target.value)}
        />

        <button
          onClick={deploy}
          disabled={uploading}
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
            uploading
              ? "bg-violet-700 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-500"
          } text-white`}
        >
          {uploading ? "Deploying..." : deployed ? "Re-deploy" : "Deploy"}
        </button>

        {/* Status Timeline */}
        {statusStep > 0 && (
          <div className="mt-6">
            <h2 className="text-white text-lg mb-4">Deployment Progress</h2>
            <ol className="relative border-l border-gray-700">
              {statusLabels.map((label, index) => (
                <li className="mb-6 ml-4" key={index}>
                  <div className="absolute w-3 h-3 bg-gray-700 rounded-full -left-1.5 border border-gray-800"></div>
                  <div className="flex items-center space-x-2">
                    {index < statusStep ? (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : index === statusStep ? (
                      <Loader2 className="text-yellow-400 w-5 h-5 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-600 rounded-full"></div>
                    )}
                    <span
                      className={`text-sm ${
                        index <= statusStep ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Success Message */}
        {deployed && (
          <div className="bg-green-600 text-white rounded-lg p-6 space-y-3 animate-fade-in">
            <p className="text-lg font-semibold">🎉 Deployment Successful!</p>
            <input
              id="deployed-url"
              readOnly
              type="url"
              className="w-full bg-green-700 rounded p-2 text-white focus:outline-none"
              value={`http://${id}.localhost:3001/index.html`}
            />
            <a
              href={`http://${id}.localhost:3001/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2 bg-white text-green-700 font-bold rounded hover:bg-gray-100 transition"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Landing;
