import { Link } from "react-router-dom";
export default function Unauthorized() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Please sign in</h1>
      <p className="text-gray-600 mb-4">Your session has expired or you’re not signed in.</p>
      <Link to="/login" className="underline">Go to login</Link>
    </div>
  );
}
