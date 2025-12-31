"use client";

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    localStorage.setItem('lastSearchQuery', value);
  };
  
  const handleSearchClick = () => {
    onSearch();
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4 mt-8">
        <input
          type="text"
          placeholder="Press Enter or click the search button to find products."
          value={searchQuery}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2 text-lg leading-tight text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:shadow-outline placeholder-gray-400"
        />
        <button
          onClick={handleSearchClick}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search
        </button>
      </div>
      <p className="text-sm text-gray-400 text-center">Search by Title and Chassis Number, Brand, Model</p>
    </>
  );
};

export default SearchBar;

