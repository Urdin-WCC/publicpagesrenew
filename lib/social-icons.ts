import {
  FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaGithub, FaTiktok, FaWhatsapp, FaTelegram, FaGlobe,
  FaWeixin, FaFacebookMessenger, FaSnapchatGhost, FaPinterest, FaRedditAlien, FaDiscord, FaSkype, FaLine, FaTumblr, FaTwitch, FaMastodon, FaStackOverflow, FaEnvelope, FaMapMarkerAlt
} from "react-icons/fa";
import { SiKuaishou, SiSinaweibo, SiThreads, SiGooglemaps } from "react-icons/si";

export const SOCIAL_ICONS = [
  { name: "X (Twitter)", value: "twitter", icon: FaTwitter },
  { name: "Facebook", value: "facebook", icon: FaFacebook },
  { name: "Instagram", value: "instagram", icon: FaInstagram },
  { name: "LinkedIn", value: "linkedin", icon: FaLinkedin },
  { name: "YouTube", value: "youtube", icon: FaYoutube },
  { name: "GitHub", value: "github", icon: FaGithub },
  { name: "WhatsApp", value: "whatsapp", icon: FaWhatsapp },
  { name: "TikTok / Douyin", value: "tiktok", icon: FaTiktok },
  // Douyin: usar FaTiktok como icono representativo
  { name: "WeChat", value: "wechat", icon: FaWeixin },
  { name: "Messenger", value: "messenger", icon: FaFacebookMessenger },
  { name: "Snapchat", value: "snapchat", icon: FaSnapchatGhost },
  { name: "Kuaishou", value: "kuaishou", icon: SiKuaishou },
  { name: "Sina Weibo", value: "weibo", icon: SiSinaweibo },
  { name: "Pinterest", value: "pinterest", icon: FaPinterest },
  // QQ: usar FaGlobe como icono genérico
  { name: "QQ", value: "qq", icon: FaGlobe },
  { name: "Reddit", value: "reddit", icon: FaRedditAlien },
  { name: "Discord", value: "discord", icon: FaDiscord },
  { name: "Skype", value: "skype", icon: FaSkype },
  { name: "Threads", value: "threads", icon: SiThreads },
  { name: "Line", value: "line", icon: FaLine },
  { name: "Tumblr", value: "tumblr", icon: FaTumblr },
  { name: "Twitch", value: "twitch", icon: FaTwitch },
  { name: "Mastodon", value: "mastodon", icon: FaMastodon },
  { name: "Stack Overflow", value: "stackoverflow", icon: FaStackOverflow },
  { name: "Email", value: "email", icon: FaEnvelope },
  { name: "Maps", value: "maps", icon: FaMapMarkerAlt },
  { name: "Google Maps", value: "googlemaps", icon: SiGooglemaps },
  // Google My Business: usar FaGlobe como icono genérico
  { name: "Google Business Profile", value: "googlemybusiness", icon: FaGlobe },
  { name: "Web", value: "web", icon: FaGlobe }
];

// Utilidad para obtener el componente de icono por valor
export function getSocialIconComponent(value: string) {
  const found = SOCIAL_ICONS.find(i => i.value === value);
  return found ? found.icon : FaGlobe;
}