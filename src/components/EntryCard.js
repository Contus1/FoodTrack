import React from 'react';

const EntryCard = ({ entry }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {entry.photo_url && (
        <img
          src={entry.photo_url}
          alt={entry.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{entry.title}</h3>
          <div className="flex">{renderStars(entry.rating)}</div>
        </div>
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {entry.notes && (
          <p className="text-gray-600 text-sm mb-2">{entry.notes}</p>
        )}
        
        <p className="text-gray-400 text-xs">
          {new Date(entry.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default EntryCard;
