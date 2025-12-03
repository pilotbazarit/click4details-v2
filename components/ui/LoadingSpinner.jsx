const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-4">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
