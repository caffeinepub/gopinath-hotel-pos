interface FooterProps {
  darkMode?: boolean;
}

export function Footer({ darkMode }: FooterProps) {
  return (
    <footer
      className={`text-center py-4 text-sm border-t ${
        darkMode
          ? "border-gray-700 text-gray-400"
          : "border-gray-100 text-gray-400"
      }`}
    >
      Powered By NextYU Solution
    </footer>
  );
}
