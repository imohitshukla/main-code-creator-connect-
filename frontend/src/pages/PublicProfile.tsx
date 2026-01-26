import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PublicProfile() {
    const { id } = useParams();
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(\`/api/creators/\${id}\`) // Using backticks for template literal
      .then(res => {
        if (!res.ok) throw new Error("Could not find creator");
        return res.json();
      })
      .then(data => {
        setCreator(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!creator) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <Link to="/filter" className="text-gray-500 mb-4 block hover:text-black">← Back to Search</Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/3 h-96 md:h-auto relative bg-gray-200">
          <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
        </div>
        
        {/* Right Side: Details */}
        <div className="w-full md:w-2/3 p-10 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{creator.name}</h1>
              <p className="text-purple-600 font-medium text-lg mt-1">{creator.niche} • {creator.location}</p>
            </div>
            <div className="text-center bg-gray-100 p-3 rounded-lg">
              <span className="block text-2xl font-bold text-gray-900">{creator.stats?.followers}</span>
              <span className="text-xs text-gray-500 uppercase">Followers</span>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-100 py-6 my-6">
            <h3 className="text-gray-900 font-bold mb-2">About Creator</h3>
            <p className="text-gray-600 leading-relaxed">{creator.bio}</p>
          </div>
          
          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Contact & Book Now
            </button>
            {creator.contact?.instagram && creator.contact.instagram !== '#' && (
              <a href={\`https://instagram.com/\${creator.contact.instagram}\`} target="_blank" rel="noreferrer" className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                📷 Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
