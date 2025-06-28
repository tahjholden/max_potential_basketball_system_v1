# Standardized Modal System

This document outlines the new standardized modal system based on the GoldModal design, providing consistent, elegant, and minimal modals across the application.

## Overview

The modal system consists of three main components:
- `GoldModal` - Base modal with minimal elegant design
- `ConfirmationModal` - For confirmations and destructive actions
- `FormModal` - For forms and data entry
- `StandardModal` - Unified API for all modal types

## Design Principles

- **Minimal Elegance**: Clean design with subtle gold accents
- **Consistent Branding**: Uses the brand gold color (`#797451`)
- **Color Matching**: Modal colors match the action button that launched them
- **Accessibility**: Proper focus management and keyboard navigation
- **Flexibility**: Multiple variants and sizes for different use cases

## Color-Matching Best Practices

### 🎨 **Modal Colors Should Match Action Buttons**

1. **Gold Modal for "Positive" Actions**
   - Use gold border/header for add/edit/confirm actions
   - Example: Add/Edit = gold button → gold-accented modal

2. **Red Modal for Danger/Destructive**
   - Use red border/header for destructive actions (delete, remove, irreversible archive)
   - Example: Delete = red/danger button → red-accented modal

3. **Gray/Neutral for Archive/Soft Actions**
   - Use neutral or outlined modal for archive, soft-disable, or "are you sure?" confirmations
   - Example: Archive = outlined button → outlined/gray modal

### 🎯 **Why This Matters**
- **Reduces user error**: Users instantly recognize "danger" or "safe" actions by color
- **Feels intentional**: Modals are "extensions" of the button that opened them
- **More "premium SaaS" feel**: This is exactly what leading platforms do for clarity and polish

## Basic Usage

### GoldModal (Base Component)

```tsx
import { GoldModal } from "@/components/ui/StandardModal";

<GoldModal
  open={open}
  onOpenChange={setOpen}
  title="Modal Title"
  description="Optional description text"
  variant="default" // default | danger | success | warning | archive | gray
  size="md" // sm | md | lg | xl
>
  <div>Your content here</div>
</GoldModal>
```

### ConfirmationModal

```tsx
import { ConfirmationModal } from "@/components/ui/StandardModal";

<ConfirmationModal
  open={open}
  onOpenChange={setOpen}
  title="Confirm Deletion"
  description="Are you sure you want to delete this item?"
  onConfirm={() => handleDelete()}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger" // Matches the danger button that opened it
  loading={loading}
/>
```

### FormModal

```tsx
import { FormModal } from "@/components/ui/StandardModal";

<FormModal
  open={open}
  onOpenChange={setOpen}
  title="Add New Player"
  description="Enter the player's information below"
  onSubmit={() => handleSubmit()}
  submitText="Add Player"
  cancelText="Cancel"
  loading={loading}
  disabled={!isValid}
  variant="default" // Matches the gold button that opened it
>
  <div className="space-y-4">
    <input placeholder="First Name" />
    <input placeholder="Last Name" />
  </div>
</FormModal>
```

### StandardModal (Unified API)

```tsx
import { StandardModal } from "@/components/ui/StandardModal";

// Confirmation modal
<StandardModal
  open={open}
  onOpenChange={setOpen}
  title="Confirm Action"
  description="Are you sure?"
  type="confirmation"
  onConfirm={() => handleConfirm()}
  variant="danger" // Matches the danger button
/>

// Form modal
<StandardModal
  open={open}
  onOpenChange={setOpen}
  title="Edit Player"
  type="form"
  onSubmit={() => handleSubmit()}
  submitText="Save Changes"
  variant="default" // Matches the gold button
>
  <div>Form content</div>
</StandardModal>

// Basic modal
<StandardModal
  open={open}
  onOpenChange={setOpen}
  title="Information"
  description="This is an informational modal"
  type="basic"
  size="lg"
  variant="default" // Matches the gold button
>
  <div>Content here</div>
</StandardModal>
```

## Convenience Hooks

### useConfirmationModal

```tsx
import { useConfirmationModal } from "@/components/ui/StandardModal";

const { createDeleteConfirmation, createArchiveConfirmation, createAddConfirmation } = useConfirmationModal();

// Delete confirmation (red variant)
{createDeleteConfirmation(
  open,
  setOpen,
  () => handleDelete(),
  "player John Doe"
)}

// Archive confirmation (gray variant)
{createArchiveConfirmation(
  open,
  setOpen,
  () => handleArchive(),
  "development plan"
)}

// Add confirmation (gold variant)
{createAddConfirmation(
  open,
  setOpen,
  () => handleAdd(),
  "new player"
)}
```

### useFormModal

```tsx
import { useFormModal } from "@/components/ui/StandardModal";

const { createAddModal, createEditModal, createDeleteModal } = useFormModal();

// Add modal (gold variant)
{createAddModal(
  open,
  setOpen,
  () => handleAdd(),
  "Add New Player",
  <div>Form content</div>,
  loading,
  !isValid
)}

// Edit modal (gold variant)
{createEditModal(
  open,
  setOpen,
  () => handleEdit(),
  "Edit Player",
  <div>Form content</div>,
  loading,
  !isValid
)}

// Delete modal (red variant)
{createDeleteModal(
  open,
  setOpen,
  () => handleDelete(),
  "Delete Player",
  <div>Confirmation content</div>,
  loading,
  !isValid
)}
```

## Variants & Color Mapping

| Variant | Border Color | Title Color | Button Color | Use Case |
|---------|-------------|-------------|--------------|----------|
| **default** | Gold (`#797451`) | Gold | Gold background | Add, Edit, Confirm actions |
| **danger** | Red (`#ef4444`) | Red | Red background | Delete, Remove, Destructive |
| **success** | Green (`#22c55e`) | Green | Green background | Success confirmations |
| **warning** | Yellow (`#eab308`) | Yellow | Yellow background | Warnings, cautions |
| **archive** | Gray (`#71717a`) | Gray | Gray background | Archive, Soft delete |
| **gray** | Light Gray (`#a1a1aa`) | Light Gray | Light Gray background | Neutral actions |

## Sizes

- **sm**: Small (max-w-sm) - For confirmations and simple messages
- **md**: Medium (max-w-md) - Default size for most modals
- **lg**: Large (max-w-lg) - For forms with more fields
- **xl**: Extra Large (max-w-xl) - For complex forms or detailed views

## Migration Guide

### From StyledModal

```tsx
// Old
<StyledModal
  open={open}
  onOpenChange={setOpen}
  title="Title"
  variant="danger"
>
  Content
</StyledModal>

// New
<GoldModal
  open={open}
  onOpenChange={setOpen}
  title="Title"
  variant="danger"
>
  Content
</GoldModal>
```

### From Custom Dialog

```tsx
// Old
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="bg-zinc-900 border-zinc-700">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
    <DialogFooter>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// New
<ConfirmationModal
  open={open}
  onOpenChange={setOpen}
  title="Title"
  onConfirm={onConfirm}
  onCancel={onCancel}
  variant="default" // or "danger" based on action type
/>
```

## Best Practices

1. **Match Button Colors**: Always use the variant that matches the action button color
   - Gold button → `variant="default"`
   - Red button → `variant="danger"`
   - Gray button → `variant="archive"`

2. **Use the right modal type**: Use `ConfirmationModal` for confirmations, `FormModal` for forms, and `GoldModal` for custom content.

3. **Consistent button text**: Use standard button text like "Save Changes", "Delete", "Cancel", etc.

4. **Loading states**: Always provide loading states for async operations.

5. **Accessibility**: The modals handle focus management automatically, but ensure your content is accessible.

6. **Error handling**: Display errors within the modal content, not as separate modals.

7. **Size appropriately**: Use smaller modals for confirmations, larger ones for forms.

## Examples

### Delete Confirmation (Red)
```tsx
// Trigger button
<EntityButton color="danger" onClick={() => setDeleteModalOpen(true)}>
  Delete Player
</EntityButton>

// Modal (matches button color)
<ConfirmationModal
  open={deleteModalOpen}
  onOpenChange={setDeleteModalOpen}
  title="Delete Player"
  description="Are you sure you want to delete John Doe? This action cannot be undone."
  onConfirm={() => handleDeletePlayer()}
  confirmText="Delete Player"
  variant="danger" // Matches the danger button
  loading={deleting}
/>
```

### Add Form (Gold)
```tsx
// Trigger button
<EntityButton color="gold" onClick={() => setAddModalOpen(true)}>
  Add Player
</EntityButton>

// Modal (matches button color)
<FormModal
  open={addModalOpen}
  onOpenChange={setAddModalOpen}
  title="Add New Player"
  description="Enter the player's information below"
  onSubmit={() => handleAddPlayer()}
  submitText="Add Player"
  variant="default" // Matches the gold button
  loading={adding}
  disabled={!firstName || !lastName}
>
  <div className="space-y-4">
    <input
      placeholder="First Name"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
    />
    <input
      placeholder="Last Name"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
    />
  </div>
</FormModal>
```

### Archive Confirmation (Gray)
```tsx
// Trigger button
<EntityButton color="archive" onClick={() => setArchiveModalOpen(true)}>
  Archive Plan
</EntityButton>

// Modal (matches button color)
<ConfirmationModal
  open={archiveModalOpen}
  onOpenChange={setArchiveModalOpen}
  title="Archive Development Plan"
  description="Are you sure you want to archive this plan? You can restore it later."
  onConfirm={() => handleArchivePlan()}
  confirmText="Archive Plan"
  variant="archive" // Matches the archive button
  loading={archiving}
/>
```

### Information Modal (Gold)
```tsx
// Trigger button
<EntityButton color="gold" onClick={() => setInfoModalOpen(true)}>
  View Details
</EntityButton>

// Modal (matches button color)
<GoldModal
  open={infoModalOpen}
  onOpenChange={setInfoModalOpen}
  title="Player Information"
  description="View detailed information about the player"
  variant="default" // Matches the gold button
  size="lg"
>
  <div className="space-y-4">
    <div>Name: John Doe</div>
    <div>Position: Forward</div>
    <div>Team: Team A</div>
  </div>
</GoldModal>
``` 