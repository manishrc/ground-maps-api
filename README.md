# FedEx & UPS Ground Maps

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/manishrc/ground-maps-api/)

## API

```
/api/<from|to>/<zip>/<fedex|ups>
```

Response is an image.

## Note

- ~~FedEx session codes expires and stops working~~ (fixed)
- UPS's website can be slow - sometimes over 15s. Vercel on the free tier has a 10s timeout. Clone this repo and upgrade to a team plan to extend to 30 second timeout.
- Images are cached for 7 day.
