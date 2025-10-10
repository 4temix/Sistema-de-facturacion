export default function LoaderFun() {
  return (
    <section className="fixed w-full h-full bg-gray-300/50 backdrop-blur-sm z-999999 flex justify-center items-center">
      <span className="relative inline-block w-12 h-12 rounded-full border-4 border-white border-r-transparent animate-spin z-30">
        <span className="absolute inset-0 m-auto w-6 h-6 rounded-full border-4 border-transparent border-r-[#FF3D00] border-l-[#FF3D00] animate-[spinBack_0.5s_linear_infinite]" />
      </span>
    </section>
  );
}
