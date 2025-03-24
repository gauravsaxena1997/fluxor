import { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../../context/ThemeContext';
import { getIconComponent, filterIconSuggestions } from '../../utils/iconUtils';

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';

// Components
import ToggleSelector from '../ToggleSelector';

// Styles
import './LinksSection.css';

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface LinkGroup {
  id: string;
  name: string;
  links: QuickLink[];
}

type LinkDisplayMode = 'icon-only' | 'name-only' | 'both';

interface LinksSectionProps {
  linkGroups: LinkGroup[];
  linkDisplayMode: LinkDisplayMode;
  setLinkGroups: React.Dispatch<React.SetStateAction<LinkGroup[]>>;
  setLinkDisplayMode: React.Dispatch<React.SetStateAction<LinkDisplayMode>>;
  linksPerRow: number;
  setLinksPerRow: React.Dispatch<React.SetStateAction<number>>;
}

const LinkModal = ({
  isOpen,
  onClose,
  onSave,
  link,
  isEdit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: QuickLink) => void;
  link: QuickLink | null;
  isEdit: boolean;
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [iconSuggestions, setIconSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  // Initialize form when opening modal
  useEffect(() => {
    if (isOpen) {
      if (link) {
        setName(link.name);
        setUrl(link.url);
        setIcon(link.icon);
      } else {
        setName('');
        setUrl('');
        setIcon('');
      }
      setError('');
    }
  }, [isOpen, link]);
  
  // Handle icon input and suggestions
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIcon(value);
    
    if (value.length >= 1) {
      const suggestions = filterIconSuggestions(value);
      setIconSuggestions(suggestions.slice(0, 8));
    } else {
      setIconSuggestions([]);
    }
  };
  
  // Select an icon suggestion
  const selectIcon = (iconName: string) => {
    setIcon(iconName);
    setIconSuggestions([]);
  };
  
  // Format URL if needed
  const formatUrl = (url: string): string => {
    if (!url) return '';
    
    url = url.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  
  // Validate and save link
  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    // Format URL if provided
    const formattedUrl = formatUrl(url);
    
    const newLink: QuickLink = {
      id: link ? link.id : `link-${Date.now()}`,
      name: name.trim(),
      url: formattedUrl,
      icon: icon.trim()
    };
    
    onSave(newLink);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };
  
  if (!isOpen) return null;
  
  // Use createPortal to render the modal at the document body level
  const modalContent = (
    <div className="link-modal-overlay" onClick={onClose}>
      <div 
        className="link-modal" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="link-modal-header">
          <h3 className="link-modal-title">{isEdit ? 'Edit Link' : 'Add New Link'}</h3>
          <button className="link-modal-close" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        
        <div className="link-modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="link-form-group">
            <label className="link-form-label" htmlFor="linkName">Name</label>
            <input 
              type="text" 
              id="linkName"
              className="link-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Link name"
              autoFocus
            />
          </div>
          
          <div className="link-form-group">
            <label className="link-form-label" htmlFor="linkUrl">URL</label>
            <input 
              type="text" 
              id="linkUrl"
              className="link-form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <small className="form-hint">URLs without http:// or https:// will have https:// added automatically</small>
          </div>
          
          <div className="link-form-group">
            <label className="link-form-label" htmlFor="linkIcon">Icon (Material Icon name)</label>
            <input 
              type="text" 
              id="linkIcon"
              className="link-form-input"
              value={icon}
              onChange={handleIconChange}
              placeholder="e.g. Home, Settings, Mail"
            />
            
            {icon && (
              <div className="icon-preview">
                <span>Preview: </span>
                {getIconComponent(icon, { size: 24 })}
              </div>
            )}
            
            {iconSuggestions.length > 0 && (
              <div className="icon-suggestions">
                {iconSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion} 
                    className="icon-suggestion"
                    onClick={() => selectIcon(suggestion)}
                    title={suggestion}
                  >
                    {getIconComponent(suggestion, { size: 20 })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="link-modal-footer">
          <div className="link-modal-actions">
            <button className="link-modal-btn link-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="link-modal-btn link-modal-save" onClick={handleSave}>
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(modalContent, document.body);
};

const SortableGroup = ({ 
  group, 
  isEditMode, 
  onGroupEdit, 
  onGroupDelete, 
  onLinkAdd, 
  onLinkEdit, 
  onLinkDelete,
  onLinkClick,
  linkDisplayMode,
  onLinkDragEnd,
  linksPerRow
}: {
  group: LinkGroup;
  isEditMode: boolean;
  onGroupEdit: (groupId: string, newName: string) => void;
  onGroupDelete: (groupId: string) => void;
  onLinkAdd: (groupId: string) => void;
  onLinkEdit: (groupId: string, linkId: string) => void;
  onLinkDelete: (groupId: string, linkId: string) => void;
  onLinkClick: (url: string) => void;
  linkDisplayMode: LinkDisplayMode;
  onLinkDragEnd: (event: DragEndEvent, groupId: string) => void;
  linksPerRow: number;
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  
  // Function to open all links in the group in new tabs
  const openAllLinks = () => {
    // Most browsers block multiple popups, so we need to handle this differently
    if (group.links.length === 0) return;
    
    // Create an invisible container for links
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-1000px';
    tempContainer.style.left = '-1000px';
    document.body.appendChild(tempContainer);
    
    // Create and click each link
    group.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      tempContainer.appendChild(a);
      a.click();
    });
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(tempContainer);
    }, 100);
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`link-group ${isDragging ? 'is-dragging' : ''} ${group.links.length === 0 ? 'empty-group' : ''}`}
    >
      <div className="group-header">
        {isEditMode && (
          <span className="drag-handle" {...attributes} {...listeners}>
            <DragIndicatorIcon />
          </span>
        )}
        
        {isEditing ? (
          <div className="group-name-edit">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              className="group-name-input"
            />
          </div>
        ) : (
          <h4 className="group-name">{group.name}</h4>
        )}
        
        <div className="group-actions">
          {!isEditMode && group.links.length > 0 && (
            <button 
              onClick={openAllLinks}
              className="icon-btn open-all-btn"
              aria-label="Open all links in this group"
              title="Open all links in this group"
            >
              <LaunchIcon fontSize="small" />
            </button>
          )}
          
          {isEditMode && (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="icon-btn edit-btn"
                aria-label="Edit group name"
                style={{ display: isEditing ? 'none' : 'flex' }}
              >
                <DriveFileRenameOutlineIcon />
              </button>
              <button 
                onClick={() => {
                  onGroupEdit(group.id, groupName);
                  setIsEditing(false);
                }}
                className="icon-btn save-btn"
                aria-label="Save group name"
                style={{ display: isEditing ? 'flex' : 'none' }}
              >
                <CheckIcon />
              </button>
              <button 
                onClick={() => onLinkAdd(group.id)} 
                className="icon-btn add-btn"
                aria-label="Add link to group"
              >
                <AddIcon />
              </button>
              
              <button 
                onClick={() => onGroupDelete(group.id)} 
                className="icon-btn delete-btn"
                aria-label="Delete group"
              >
                <DeleteIcon />
              </button>
            </>
          )}
        </div>
      </div>
      
      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
          }),
          useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
          })
        )}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onLinkDragEnd(event, group.id)}
      >
        <div 
          className={`group-links ${group.links.length === 0 ? 'empty-group-container' : ''}`}
          data-links-per-row={group.links.length > 0 ? linksPerRow : undefined}
          data-group-id={group.id}
        >
          {!isEditMode && group.links.length === 0 ? (
            <div className="empty-group-message">
              No links in this group. Switch to edit mode to add links.
            </div>
          ) : (
            <SortableContext
              items={group.links.map(link => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {group.links.map(link => (
                <SortableLink
                  key={link.id}
                  link={link}
                  isEditMode={isEditMode}
                  linkDisplayMode={linkDisplayMode}
                  onEdit={() => onLinkEdit(group.id, link.id)}
                  onDelete={() => onLinkDelete(group.id, link.id)}
                  onClick={() => onLinkClick(link.url)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  );
};

const SortableLink = ({ 
  link, 
  isEditMode, 
  linkDisplayMode, 
  onEdit, 
  onDelete,
  onClick
}: {
  link: QuickLink;
  isEditMode: boolean;
  linkDisplayMode: LinkDisplayMode;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id: link.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  
  const handleLinkClick = () => {
    if (!isEditMode) {
      onClick();
    }
  };
  
  // Determine what to display based on mode and available data
  const showIcon = (linkDisplayMode === 'both') || (linkDisplayMode === 'icon-only' && link.icon);
  const showName = (linkDisplayMode === 'name-only') || 
                   (linkDisplayMode === 'both') || 
                   (linkDisplayMode === 'icon-only' && !link.icon);

  // Determine if URL is valid - used for visual feedback
  const hasValidUrl = link.url && link.url.trim().length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`quick-link ${isDragging ? 'is-dragging' : ''} ${isEditMode ? 'edit-mode' : ''} ${!hasValidUrl ? 'no-url' : ''}`}
      title={hasValidUrl ? link.url : 'No URL set'}
    >
      <div 
        className="link-content"
        onClick={handleLinkClick}
      >
        {showIcon && (
          <div className="link-icon">
            {getIconComponent(link.icon || 'link', { size: 24 })}
          </div>
        )}
        
        {showName && (
          <div className="link-name">{link.name}</div>
        )}
      </div>
      
      {isEditMode && (
        <div className="link-edit-controls">
          <button 
            className="link-drag-btn"
            {...attributes}
            {...listeners}
            aria-label="Drag link"
            title="Drag to reorder"
          >
            <DragIndicatorIcon style={{ fontSize: '16px' }} />
          </button>
          <button 
            onClick={onEdit} 
            className="link-edit-btn"
            aria-label="Edit link"
            title="Edit link"
          >
            <DriveFileRenameOutlineIcon style={{ fontSize: '16px' }} />
          </button>
          <button 
            onClick={onDelete} 
            className="link-delete-btn"
            aria-label="Delete link"
            title="Delete link"
          >
            <DeleteIcon style={{ fontSize: '16px' }} />
          </button>
        </div>
      )}
    </div>
  );
};

const LinksSection = ({
  linkGroups,
  linkDisplayMode,
  setLinkGroups,
  setLinkDisplayMode,
  linksPerRow,
  setLinksPerRow,
}: LinksSectionProps) => {
  const { isDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<QuickLink | null>(null);
  const [activeLinkGroupId, setActiveLinkGroupId] = useState<string | null>(null);
  const [isLinkEdit, setIsLinkEdit] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  
  // Sensors for drag and drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Only activate after moving 5px
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Check for window resize to determine mobile vs desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Save changes when exiting edit mode
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  // Handle adding a new group
  const handleAddGroup = () => {
    if (groupNameInput.trim()) {
      const newGroup = {
        id: `group-${Date.now()}`,
        name: groupNameInput.trim(),
        links: []
      };
      
      setLinkGroups([...linkGroups, newGroup]);
      setGroupNameInput('');
    }
  };

  // Handle editing a group name
  const handleGroupEdit = (groupId: string, newName: string) => {
    setLinkGroups(
      linkGroups.map(group => 
        group.id === groupId 
          ? { ...group, name: newName } 
          : group
      )
    );
  };

  // Handle deleting a group
  const handleGroupDelete = (groupId: string) => {
    setLinkGroups(linkGroups.filter(group => group.id !== groupId));
  };

  // Functions for link editing
  const handleEditLink = (groupId: string, linkId: string) => {
    setActiveLinkGroupId(groupId);
    setActiveLink(null);
    setIsLinkEdit(true);
    
    // Find active link data
    const group = linkGroups.find(g => g.id === groupId);
    if (group) {
      const link = group.links.find(l => l.id === linkId);
      if (link) {
        setActiveLink(link);
        setIsLinkModalOpen(true);
      }
    }
  };

  // Handle adding a new link
  const handleAddLink = (newLink: QuickLink) => {
    if (!activeLinkGroupId) return;
    
    setLinkGroups(
      linkGroups.map(group =>
        group.id === activeLinkGroupId
          ? { 
              ...group, 
              links: [
                ...group.links, 
                {
                  ...newLink,
                  id: `link-${Date.now()}`
                }
              ] 
            }
          : group
      )
    );
    
    setIsLinkModalOpen(false);
  };

  // Handle saving an edited link
  const handleSaveEditedLink = (updatedLink: QuickLink) => {
    if (!activeLinkGroupId || !activeLink) return;
    
    setLinkGroups(
      linkGroups.map(group =>
        group.id === activeLinkGroupId
          ? { 
              ...group, 
              links: group.links.map(link =>
                link.id === activeLink.id
                  ? { ...updatedLink, id: link.id }
                  : link
              ) 
            }
          : group
      )
    );
    
    setIsLinkModalOpen(false);
    setActiveLinkGroupId(null);
    setIsLinkEdit(false);
  };

  // Handle deleting a link
  const handleLinkDelete = (groupId: string, linkId: string) => {
    setLinkGroups(
      linkGroups.map(group =>
        group.id === groupId
          ? { 
              ...group, 
              links: group.links.filter(link => link.id !== linkId) 
            }
          : group
      )
    );
  };

  // Handle clicking a link (open in new tab)
  const handleLinkClick = (url: string) => {
    if (!isEditMode && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle drag end for groups
  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLinkGroups(currentGroups => {
        const activeIndex = currentGroups.findIndex((g: LinkGroup) => g.id === active.id);
        const overIndex = currentGroups.findIndex((g: LinkGroup) => g.id === over.id);
        
        return arrayMove(currentGroups, activeIndex, overIndex);
      });
    }
  };

  // Handle drag end for links within a group
  const handleLinkDragEnd = (event: DragEndEvent, groupId: string) => {
    const { active, over } = event;

    // First check if we're moving links within the same group
    if (over && active.id !== over.id) {
      const isOverALink = over.id.toString().startsWith('link-');
      
      if (isOverALink) {
        // Handle move within the same group
        setLinkGroups(currentGroups => {
          return currentGroups.map(group => {
            if (group.id !== groupId) return group;
            
            const activeIndex = group.links.findIndex((l: QuickLink) => l.id === active.id);
            const overIndex = group.links.findIndex((l: QuickLink) => l.id === over.id);
            
            return {
              ...group,
              links: arrayMove(group.links, activeIndex, overIndex)
            };
          });
        });
      } else {
        // Handle move between groups - 'over' is a group
        const targetGroupId = over.id.toString();
        
        // Extract data about the link we're moving
        let linkToMove: QuickLink | undefined;
        let sourceGroupId: string | undefined;
        
        // Find the link and its source group
        linkGroups.forEach(group => {
          const link = group.links.find(l => l.id === active.id);
          if (link) {
            linkToMove = link;
            sourceGroupId = group.id;
          }
        });
        
        if (linkToMove && sourceGroupId && sourceGroupId !== targetGroupId) {
          // Move link from source group to target group
          setLinkGroups(currentGroups => {
            return currentGroups.map(group => {
              // Remove from source group
              if (group.id === sourceGroupId) {
                return {
                  ...group,
                  links: group.links.filter((l: QuickLink) => l.id !== active.id)
                };
              }
              
              // Add to target group
              if (group.id === targetGroupId) {
                return {
                  ...group,
                  links: [...group.links, linkToMove!]
                };
              }
              
              return group;
            });
          });
        }
      }
    }
  };

  return (
    <div className={`links-section ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Quick Links header with edit/save button */}
      <div className="links-section-header">
        <h3>Quick Links</h3>
        {isEditMode && (
          <div className="header-group-form">
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder="New group"
              className="header-group-input"
            />
            <button 
              onClick={handleAddGroup}
              className="header-group-btn"
              disabled={!groupNameInput.trim()}
              title="Create new group"
            >
              <AddIcon />
            </button>
          </div>
        )}
        <button 
          className="edit-toggle-btn icon-btn" 
          onClick={toggleEditMode}
          aria-label={isEditMode ? "Save changes" : "Edit links"}
        >
          {isEditMode ? <SaveIcon /> : <EditIcon />}
        </button>
      </div>
      
      {/* Edit controls appear below header when in edit mode */}
      {isEditMode && (
        <div className="edit-controls-panel">
          <div className="settings-row">
            <div className="settings-label">Display Mode</div>
            <div className="settings-input">
              <ToggleSelector
                options={[
                  { value: 'icon-only', label: 'Icons Only' },
                  { value: 'name-only', label: 'Names Only' },
                  { value: 'both', label: 'Both' },
                ]}
                value={linkDisplayMode}
                onChange={(value: string) => setLinkDisplayMode(value as LinkDisplayMode)}
              />
            </div>
          </div>
          
          <div className="settings-row">
            <div className="settings-label">Links Per Row</div>
            <div className="settings-input links-per-row-control">
              <button 
                className="control-btn" 
                onClick={() => linksPerRow > 1 && setLinksPerRow(linksPerRow - 1)}
                disabled={linksPerRow <= 1}
                aria-label="Decrease links per row"
              >
                <RemoveIcon />
              </button>
              <span className="value-display">{linksPerRow}</span>
              <button 
                className="control-btn" 
                onClick={() => linksPerRow < 5 && setLinksPerRow(linksPerRow + 1)}
                disabled={linksPerRow >= 5}
                aria-label="Increase links per row"
              >
                <AddIcon />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="links-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGroupDragEnd}
        >
          <SortableContext
            items={linkGroups.map(group => group.id)}
            strategy={verticalListSortingStrategy}
          >
            {linkGroups.map(group => (
              <SortableGroup
                key={group.id}
                group={group}
                isEditMode={isEditMode}
                onGroupEdit={handleGroupEdit}
                onGroupDelete={handleGroupDelete}
                onLinkAdd={(groupId) => {
                  setActiveLinkGroupId(groupId);
                  setIsLinkEdit(false);
                  setActiveLink(null);
                  setIsLinkModalOpen(true);
                }}
                onLinkEdit={handleEditLink}
                onLinkDelete={handleLinkDelete}
                onLinkClick={handleLinkClick}
                linkDisplayMode={linkDisplayMode}
                onLinkDragEnd={handleLinkDragEnd}
                linksPerRow={linksPerRow}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Link Modal for Add/Edit */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setActiveLinkGroupId(null);
          setIsLinkEdit(false);
        }}
        onSave={isLinkEdit ? handleSaveEditedLink : handleAddLink}
        link={activeLink}
        isEdit={isLinkEdit}
      />
    </div>
  );
};

export default LinksSection;
