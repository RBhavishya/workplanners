const Loading = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/60">
      <img
        src="/src/assets/6-dots-scale.svg"
        alt="loader"
        width={100}
        height={100}
      />
    </div>
  );
};

export default Loading;
