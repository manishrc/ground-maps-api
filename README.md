# Ground Maps for UPS & FedEx

## API
```
/api/<from|to>/<zip>/<fedex|ups>
```

Response is an image.

## Note
- FedEx session codes expires and stops working
- UPS's website can be slow - sometimes over 15s. Vercel on the free tier has a 10s timeout.
- Uses Cloudinary for caching the images. (Default fetch cache is 7 days). 
- Cloudinary URLs from my account will only work from `ground-maps-api.now.sh`. Please use your account or drop cloudinary from the image URLs
