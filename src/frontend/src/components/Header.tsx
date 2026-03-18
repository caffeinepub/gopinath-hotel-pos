const LOGO_PATH = `${import.meta.env.BASE_URL}assets/uploads/homeScreenLogo-1.jpeg`;

export function Header() {
  return (
    <div className="flex flex-col items-center pt-8 pb-4 md:pt-10 md:pb-6">
      <img
        src={LOGO_PATH}
        alt="Gopinath Hotel"
        className="w-48 h-auto md:w-64 object-contain drop-shadow-sm"
      />
    </div>
  );
}
