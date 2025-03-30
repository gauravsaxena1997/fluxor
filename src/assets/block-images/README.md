# Block Page Images

This directory contains images used for the Focus Warden block page. When a user tries to access a blocked site, one of these images will be randomly selected as the background.

## Requirements for block images:

1. Images should be high quality (minimum 1920x1080px recommended)
2. File format should be JPG or PNG
3. Images should be related to productivity, focus, or blocking distractions
4. Images should ideally be humorous or motivational
5. Name images as `block1.jpg`, `block2.jpg`, etc.

## How to add custom images:

1. Add your image files to this directory
2. Update the imports in `src/components/FocusWarden/blocked-page.tsx` to include your new images
3. Add the imported images to the `blockImages` array

## Attribution:

The default images included in this directory were created specifically for the Focus Warden feature. You are free to replace them with your own custom images.

## Note:

If running into issues with image imports, make sure your build system is properly configured to handle image assets. You may need to update the module declarations in your TypeScript configuration. 