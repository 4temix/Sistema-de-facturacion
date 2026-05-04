interface LoaderFunProps {
  absolute?: boolean;
}
export default function LoaderFun({ absolute = false }: LoaderFunProps) {
  return (
    <section
      className={`${
        absolute ? "absolute inset-0" : "fixed inset-0"
      } z-[100020] flex items-center justify-center bg-gray-300/50 backdrop-blur-sm`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="relative inline-block w-12 h-12 rounded-full border-4 border-white border-r-transparent animate-spin z-30">
        <span className="absolute inset-0 m-auto w-6 h-6 rounded-full border-4 border-transparent border-r-[#FF3D00] border-l-[#FF3D00] animate-[spinBack_0.5s_linear_infinite]" />
      </span>
    </section>
  );
}
