import React from 'react';
// Material UI icons
import LinkIcon from '@mui/icons-material/Link';

// Font Awesome icons (fa)
import { 
  FaYoutube, FaTwitter, FaFacebook, FaInstagram, FaGithub, FaLinkedin,
  FaReddit, FaAmazon, FaApple, FaMicrosoft, FaSpotify, FaSlack,
  FaDiscord, FaWhatsapp, FaTelegram, FaTiktok, FaTwitch, FaPinterest,
  FaDropbox, FaDribbble, FaMedium, FaEtsy, FaJira,
  FaTrello, FaFigma, FaChrome, FaFirefox, FaOpera, FaBitcoin, FaEthereum, FaCcVisa, FaCcMastercard, FaCcPaypal
} from 'react-icons/fa';

// Flat Color icons (fc)
import { FcGoogle } from 'react-icons/fc';

// Material Design icons (md)
import { 
  MdEmail, MdLink, MdCloudDownload, MdSettings, MdHome, MdWork, 
  MdSchool, MdPerson, MdShoppingCart, MdLocalGroceryStore, MdAttachMoney,
  MdDashboard, MdNotifications, MdSearch, MdFavorite, MdStar, MdChat,
  MdPhone, MdLocationOn, MdCalendarToday, MdAccessTime, MdMoreVert
} from 'react-icons/md';

// Simple Icons (si) - for brands not in FA
import { 
  SiNetflix, SiAirbnb, SiUber, SiAsana, SiNotion, SiCanva,
  SiZoom, SiWordpress, SiShopify
} from 'react-icons/si';

// Icon list for suggestions
export const ICON_NAMES = [
  'google', 'youtube', 'twitter', 'facebook', 'instagram', 'github', 
  'linkedin', 'reddit', 'amazon', 'apple', 'microsoft', 'spotify',
  'slack', 'discord', 'whatsapp', 'telegram', 'tiktok', 'twitch',
  'pinterest', 'email', 'download', 'settings', 'home', 'work', 
  'school', 'person', 'shopping', 'store', 'money', 'dashboard', 
  'notifications', 'search', 'favorite', 'star', 'chat', 'phone',
  'location', 'calendar', 'time', 'more', 'netflix', 'airbnb', 
  'uber', 'asana', 'notion', 'canva', 'zoom', 'wordpress', 'shopify',
  'dropbox', 'dribbble', 'medium', 'etsy', 'jira', 'trello', 'figma',
  'chrome', 'firefox', 'opera', 'visa', 'mastercard', 'paypal',
  'bitcoin', 'ethereum'
];

/**
 * Filter icon suggestions based on input
 */
export const filterIconSuggestions = (input: string): string[] => {
  if (!input || input.length < 2) return [];
  
  const lowercaseInput = input.toLowerCase();
  return ICON_NAMES.filter(name => 
    name.toLowerCase().includes(lowercaseInput)
  ).slice(0, 8); // Limit to 8 suggestions
};

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Get icon component by name
 */
export const getIconComponent = (iconName: string, options: IconProps = {}): React.ReactNode => {
  const { size = 24, color } = options;
  
  // Handle emoji icons
  if (!/^[A-Za-z]/.test(iconName)) {
    return <span style={{ fontSize: size, lineHeight: '1' }}>{iconName}</span>;
  }
  
  // Default colors for known brands/services
  const getDefaultColor = (name: string): string | undefined => {
    const colorMap: Record<string, string> = {
      youtube: '#FF0000',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      instagram: '#E4405F', 
      github: '#111111',
      linkedin: '#0A66C2',
      reddit: '#FF4500',
      amazon: '#FF9900',
      apple: '#555555',
      microsoft: '#00A4EF',
      spotify: '#1DB954', 
      slack: '#4A154B',
      discord: '#5865F2',
      whatsapp: '#25D366',
      telegram: '#0088CC',
      tiktok: '#000000',
      twitch: '#9146FF',
      pinterest: '#E60023',
      email: '#D44638',
      download: '#0066cc',
      settings: '#555555',
      home: '#4CAF50',
      work: '#FF9800',
      school: '#9C27B0',
      netflix: '#E50914',
      airbnb: '#FF5A5F',
      uber: '#000000',
      asana: '#FC636B',
      notion: '#000000',
      canva: '#00C4CC',
      zoom: '#2D8CFF',
      wordpress: '#21759B',
      shopify: '#7AB55C',
      dropbox: '#0061FF',
      dribbble: '#EA4C89',
      medium: '#000000',
      etsy: '#F45800',
      jira: '#0052CC',
      trello: '#0079BF',
      figma: '#F24E1E',
      chrome: '#4285F4',
      firefox: '#FF7133',
      opera: '#FF1B2D',
      visa: '#1A1D23',
      mastercard: '#F87931',
      paypal: '#00457C',
      bitcoin: '#F7931A',
      ethereum: '#627EEA'
    };
    
    return color || colorMap[name.toLowerCase()];
  };

  // Icon mapping
  const name = iconName.toLowerCase();
  const iconColor = getDefaultColor(name);
  
  switch (name) {
    // Font Awesome brand icons
    case 'youtube': return <FaYoutube size={size} color={iconColor} />;
    case 'twitter': return <FaTwitter size={size} color={iconColor} />;
    case 'facebook': return <FaFacebook size={size} color={iconColor} />;
    case 'instagram': return <FaInstagram size={size} color={iconColor} />;
    case 'github': return <FaGithub size={size} color={iconColor} />;
    case 'linkedin': return <FaLinkedin size={size} color={iconColor} />;
    case 'reddit': return <FaReddit size={size} color={iconColor} />;
    case 'amazon': return <FaAmazon size={size} color={iconColor} />;
    case 'apple': return <FaApple size={size} color={iconColor} />;
    case 'microsoft': return <FaMicrosoft size={size} color={iconColor} />;
    case 'spotify': return <FaSpotify size={size} color={iconColor} />;
    case 'slack': return <FaSlack size={size} color={iconColor} />;
    case 'discord': return <FaDiscord size={size} color={iconColor} />;
    case 'whatsapp': return <FaWhatsapp size={size} color={iconColor} />;
    case 'telegram': return <FaTelegram size={size} color={iconColor} />;
    case 'tiktok': return <FaTiktok size={size} color={iconColor} />;
    case 'twitch': return <FaTwitch size={size} color={iconColor} />;
    case 'pinterest': return <FaPinterest size={size} color={iconColor} />;
    case 'dropbox': return <FaDropbox size={size} color={iconColor} />;
    case 'dribbble': return <FaDribbble size={size} color={iconColor} />;
    case 'medium': return <FaMedium size={size} color={iconColor} />;
    case 'etsy': return <FaEtsy size={size} color={iconColor} />;
    case 'jira': return <FaJira size={size} color={iconColor} />;
    case 'trello': return <FaTrello size={size} color={iconColor} />;
    case 'figma': return <FaFigma size={size} color={iconColor} />;
    case 'chrome': return <FaChrome size={size} color={iconColor} />;
    case 'firefox': return <FaFirefox size={size} color={iconColor} />;
    case 'opera': return <FaOpera size={size} color={iconColor} />;
    case 'visa': return <FaCcVisa size={size} color={iconColor} />;
    case 'mastercard': return <FaCcMastercard size={size} color={iconColor} />;
    case 'paypal': return <FaCcPaypal size={size} color={iconColor} />;
    case 'bitcoin': return <FaBitcoin size={size} color={iconColor} />;
    case 'ethereum': return <FaEthereum size={size} color={iconColor} />;
    
    // Flat color icons
    case 'google': return <FcGoogle size={size} />;
    
    // Material Design icons
    case 'email':
    case 'mail': return <MdEmail size={size} color={iconColor} />;
    case 'link': return <MdLink size={size} color={iconColor || '#0066cc'} />;
    case 'download': return <MdCloudDownload size={size} color={iconColor} />;
    case 'settings': return <MdSettings size={size} color={iconColor} />;
    case 'home': return <MdHome size={size} color={iconColor} />;
    case 'work': return <MdWork size={size} color={iconColor} />;
    case 'school': return <MdSchool size={size} color={iconColor} />;
    case 'person': return <MdPerson size={size} color={iconColor || '#4287f5'} />;
    case 'shopping':
    case 'cart': return <MdShoppingCart size={size} color={iconColor || '#4287f5'} />;
    case 'store': return <MdLocalGroceryStore size={size} color={iconColor || '#4287f5'} />;
    case 'money': return <MdAttachMoney size={size} color={iconColor || '#4287f5'} />;
    case 'dashboard': return <MdDashboard size={size} color={iconColor || '#4287f5'} />;
    case 'notifications': return <MdNotifications size={size} color={iconColor || '#4287f5'} />;
    case 'search': return <MdSearch size={size} color={iconColor || '#4287f5'} />;
    case 'favorite': return <MdFavorite size={size} color={iconColor || '#e91e63'} />;
    case 'star': return <MdStar size={size} color={iconColor || '#ffc107'} />;
    case 'chat': return <MdChat size={size} color={iconColor || '#4287f5'} />;
    case 'phone': return <MdPhone size={size} color={iconColor || '#4287f5'} />;
    case 'location': return <MdLocationOn size={size} color={iconColor || '#4287f5'} />;
    case 'calendar': return <MdCalendarToday size={size} color={iconColor || '#4287f5'} />;
    case 'time': return <MdAccessTime size={size} color={iconColor || '#4287f5'} />;
    case 'more': return <MdMoreVert size={size} color={iconColor || '#4287f5'} />;
    
    // Simple Icons for popular brands not in FA
    case 'netflix': return <SiNetflix size={size} color={iconColor} />;
    case 'airbnb': return <SiAirbnb size={size} color={iconColor} />;
    case 'uber': return <SiUber size={size} color={iconColor} />;
    case 'asana': return <SiAsana size={size} color={iconColor} />;
    case 'notion': return <SiNotion size={size} color={iconColor} />;
    case 'canva': return <SiCanva size={size} color={iconColor} />;
    case 'zoom': return <SiZoom size={size} color={iconColor} />;
    case 'wordpress': return <SiWordpress size={size} color={iconColor} />;
    case 'shopify': return <SiShopify size={size} color={iconColor} />;
    
    // Material UI default link icon as fallback
    default: return <LinkIcon style={{ fontSize: size, color: color || '#0066cc' }} />;
  }
};
