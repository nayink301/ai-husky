import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-gray-600 mb-4">The page you’re looking for doesn’t exist.</p>
      <Link to="/dashboard" className="underline">Go to dashboard</Link>
    </div>
  );
}
