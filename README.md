# Fluxor - Productivity Browser Extension

Fluxor is a powerful Chrome extension designed to boost your productivity by combining a customizable new tab page with a distraction-blocking system. It helps you organize your favorite websites and stay focused by preventing access to time-wasting sites.

## Key Features

### 🎨 Fully Customizable Quick Links

The heart of Fluxor is its highly customizable quick links system, allowing you to:

- **Organize Links in Groups**: Create logical collections of links like "Work", "Social", "Development", etc.
- **Custom Styling**: Personalize each link with:
  - Custom background colors (any hex color value)
  - Custom icon colors to match your theme or visual preferences
  - Choose from hundreds of Material UI icons
  - Support for popular social media icons (GitHub, Twitter, LinkedIn, etc.)
- **Flexible Display Options**:
  - Choose between icon-only, name-only, or both display modes
  - Adjust the number of links per row (1-5) to suit your preferences
- **Drag-and-Drop Organization**: Easily reorder both groups and individual links
- **Intuitive Editing Interface**: Simple controls for adding, editing, and removing links

### 🛡️ Focus Warden

Boost your productivity with powerful website blocking features:

- **Flexible Blocking Rules**:
  - **Permanent Blocking**: Block distracting sites indefinitely
  - **Time-Limited Blocking**: Block sites for a specific duration (perfect for temporary focus sessions)
- **Smart Redirect**: Blocked sites redirect to a custom blocked page that reminds you why you're blocking the site
- **Statistics Dashboard**: Track your blocking history and productivity trends
- **Simple Management**: Easy interface to add, edit, and remove blocked sites

### 🌈 Personalization Options

Make Fluxor truly yours with extensive customization:

- **Themes**: Choose between light and dark themes
- **Background Images**: Set a custom background image for your new tab page
- **Accent Colors**: Select your preferred accent color for UI elements
- **Responsive Design**: Works beautifully on all screen sizes

## Technical Implementation

Fluxor is built with modern web technologies:

- **Frontend**: React 19 with TypeScript for type safety
- **Styling**: Combination of TailwindCSS and custom CSS for flexible styling
- **UI Components**: Material UI icons and components
- **State Management**: Context API with local storage persistence
- **Extension API**: Chrome Extension APIs (declarativeNetRequest, storage, webNavigation)
- **Drag-and-Drop**: @dnd-kit library for smooth drag-and-drop interactions

## Getting Started

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/fluxor.git
   cd fluxor
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

4. Build for production
   ```
   npm run build
   ```

### Loading as a Chrome Extension

1. Build the project with `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` folder from your project

## Usage Guide

### Managing Quick Links

1. **Adding Links**:
   - Click the Edit (pencil) icon in the Quick Links section
   - Click the + button in any group to add a new link
   - Enter the link name, URL, and select an icon
   - Customize the background and icon colors as desired
   - Click "Add" to save

2. **Editing Links**:
   - In edit mode, click on a link you want to edit
   - Modify any properties (name, URL, icon, colors)
   - Click "Update" to save changes

3. **Organizing Links**:
   - In edit mode, use the drag handles to reorder links
   - Create new groups by entering a name in the header and clicking +
   - Drag groups to reorder them

### Using Focus Warden

1. **Blocking Websites**:
   - Click on the Focus Warden widget
   - Enter the URL of the site you want to block
   - Choose between permanent or time-limited blocking
   - For time-limited, set the duration in minutes
   - Click "Block Site"

2. **Managing Blocked Sites**:
   - View all blocked sites in the Focus Warden widget
   - Remove sites by clicking the delete button
   - Edit blocking rules by clicking on a site

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
