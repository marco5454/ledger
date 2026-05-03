# Universal Theming System - Documentation

## Overview

This ledger application uses a comprehensive, universal theming system built with CSS custom properties (CSS variables). The theme ensures consistency across the entire application with a minimal, polished design.

## Color Palette

The application strictly uses the following colors:

### Primary Colors
- **Background**: `#F9F9F9` (Warm White) - Used for page backgrounds
- **Text**: `#1A1A1A` (Charcoal) - Used for all text content
- **Accent**: `#64748B` (Soft Slate Blue) - Used for interactive elements, buttons, and highlights

### Derived Colors (for UI consistency)
- **Accent Hover**: `#475569` - Darker shade for hover states
- **Accent Light**: `#94a3b8` - Lighter shade for placeholders and subtle elements
- **Border**: `#e5e7eb` - Subtle borders
- **Surface**: `#ffffff` - Cards, modals, and elevated surfaces
- **Error**: `#dc2626` - Error states and destructive actions
- **Success**: `#16a34a` - Success states and confirmations
- **Warning**: `#ea580c` - Warning states

## Typography

### Font Family
- **Primary Font**: Roboto (already loaded via Google Fonts in index.html)
- **Fallback**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)

## Using the Theme

### CSS Variables

All theme values are available as CSS custom properties. Use them in your styles:

```css
.my-component {
  color: var(--color-text);
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
}
```

### Pre-built Component Classes

The theme includes ready-to-use classes for common components:

#### Buttons
```jsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>
<button className="btn btn-danger">Delete</button>
<button className="btn btn-success">Confirm</button>
<button className="btn btn-sm">Small Button</button>
<button className="btn btn-lg">Large Button</button>
```

#### Cards
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
  </div>
  <div className="card-body">
    Card content goes here
  </div>
</div>
```

#### Forms
```jsx
<div className="form-group">
  <label>Label Text</label>
  <input type="text" placeholder="Enter text..." />
  <div className="form-error">Error message</div>
</div>
```

#### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-warning">Warning</span>
```

#### Alerts
```jsx
<div className="alert alert-success">Success message</div>
<div className="alert alert-error">Error message</div>
<div className="alert alert-warning">Warning message</div>
<div className="alert alert-info">Info message</div>
```

#### Modals
```jsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h3 className="modal-title">Modal Title</h3>
      <button className="modal-close">×</button>
    </div>
    <div className="modal-body">
      Modal content
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Utility Classes

#### Text Utilities
- `text-center`, `text-left`, `text-right` - Text alignment
- `text-sm`, `text-lg` - Font sizes
- `text-bold`, `text-medium` - Font weights
- `text-accent`, `text-error`, `text-success` - Text colors

#### Spacing Utilities
- `mt-sm`, `mt-md`, `mt-lg` - Margin top
- `mb-sm`, `mb-md`, `mb-lg` - Margin bottom

#### Layout Utilities
- `flex`, `flex-col` - Flexbox
- `items-center`, `justify-center`, `justify-between` - Flex alignment
- `gap-sm`, `gap-md`, `gap-lg` - Gap spacing
- `w-full`, `h-full` - Full width/height

#### Loading Spinner
```jsx
<div className="spinner"></div>
<div className="spinner spinner-sm"></div>
<div className="spinner spinner-lg"></div>
```

## Spacing System

Consistent spacing throughout the app:
- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)

## Border Radius

- `--radius-sm`: 0.25rem (4px)
- `--radius-md`: 0.5rem (8px)
- `--radius-lg`: 0.75rem (12px)
- `--radius-xl`: 1rem (16px)

## Shadows

- `--shadow-sm`: Subtle shadow for cards
- `--shadow-md`: Medium shadow for elevated elements
- `--shadow-lg`: Large shadow for modals and popovers

## Transitions

- `--transition-fast`: 150ms ease-in-out
- `--transition-base`: 200ms ease-in-out
- `--transition-slow`: 300ms ease-in-out

## Responsive Design

The theme includes responsive breakpoints:
- **Mobile**: max-width 480px
- **Tablet**: max-width 768px
- **Desktop**: Above 768px

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Use pre-built classes** when available for consistency
3. **Follow the spacing system** for margins and padding
4. **Use semantic HTML** with appropriate ARIA labels
5. **Test on multiple screen sizes** using the responsive breakpoints
6. **Maintain the minimal aesthetic** - avoid adding extra colors or styles

## Examples

### Login Form
```jsx
<div className="container container-sm">
  <div className="card">
    <div className="card-header">
      <h2 className="card-title">Login</h2>
    </div>
    <div className="card-body">
      <form>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Sign In
        </button>
      </form>
    </div>
  </div>
</div>
```

### Dashboard Card
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Monthly Summary</h3>
    <span className="badge badge-success">Active</span>
  </div>
  <div className="card-body">
    <div className="flex justify-between mb-md">
      <span className="text-medium">Total Income</span>
      <span className="text-success text-bold">$5,000</span>
    </div>
    <div className="flex justify-between">
      <span className="text-medium">Total Expenses</span>
      <span className="text-error text-bold">$3,200</span>
    </div>
  </div>
</div>
```

## Maintenance

To modify the theme:
1. Update CSS variables in `:root` selector in `styles.css`
2. Changes will automatically propagate throughout the application
3. Test all pages to ensure consistency
4. Update this documentation if adding new components or utilities

---

**Note**: This theming system is designed to be minimal and focused. Avoid introducing additional colors or visual styles beyond those specified to maintain consistency and polish.