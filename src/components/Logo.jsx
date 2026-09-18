import { kraftLogo, kraftLogoLight } from "../assets";
import { useTheme } from "../theme";

/* Логотип, следящий за темой: на светлом фоне — версия с тёмной надписью
   на светлой плашке, на тёмном — оригинал. */
export function Logo({ className = "", ...rest }) {
  const { resolved } = useTheme();
  return <img src={resolved === "light" ? kraftLogoLight : kraftLogo} alt="" className={className} {...rest} />;
}
