export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );
}
