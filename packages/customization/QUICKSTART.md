# Module 3: Quick Start Guide

> **Get up and running in 5 minutes** ⚡

---

## 🎯 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Terminal/Command Prompt

---

## ⚡ 5-Minute Setup

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd module-3-customization/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend server
npm run dev
```

✅ Backend running on http://localhost:3002

---

### Step 2: Frontend Setup (2 minutes)

**Open a new terminal:**

```bash
# Navigate to frontend
cd module-3-customization/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:5173

---

### Step 3: Open Browser (1 minute)

Open http://localhost:5173 in your browser!

You should see the QR Customization Studio! 🎨

---

## 🧪 Test It Works

### Create Your First Custom QR Code

1. **Enter data**: Type `https://example.com` in the data field

2. **Change colors**: 
   - Click foreground color → Pick a cool blue (#1E3A8A)
   - Click background color → Pick light yellow (#FEF3C7)

3. **Pick pattern**: Click "Dots" pattern

4. **Add logo** (optional): Drag and drop any image

5. **Download**: Click "Download PNG"

✅ Success! You've created a custom QR code!

---

## 💡 Quick Tips

### Change Port Numbers

**Backend (default: 3002):**

Edit `backend/.env`:
```env
PORT=3002
```

**Frontend (default: 5173):**

Edit `frontend/vite.config.js`:
```js
server: {
  port: 5173
}
```

---

### Save a Template

1. Customize a QR code
2. Click "Save as Template"
3. Enter name → Save
4. View in "Templates" tab

---

### Use Featured Templates

1. Click "Templates" tab
2. Click "Featured" sub-tab
3. Click any template to apply it
4. Switch back to "Editor" tab
5. Your design is loaded!

---

## 🔧 Troubleshooting

### Backend won't start

**Error:** `Port 3002 is already in use`

**Solution:** Change port in `backend/.env`:
```env
PORT=3003
```

---

### Frontend can't connect to backend

**Error:** `Network Error` in browser console

**Solution:** 
1. Check backend is running
2. Update frontend `.env`:
```env
VITE_API_URL=http://localhost:3002/api
```
3. Restart frontend

---

### Preview not updating

**Solution:**
1. Refresh browser (Ctrl+R / Cmd+R)
2. Clear browser cache
3. Check backend terminal for errors

---

### Logo upload fails

**Error:** `File too large`

**Solution:** 
- Resize image to <5MB
- Use PNG, JPG, or WEBP format
- Compress image before uploading

---

## 📚 Next Steps

Now that you're up and running:

1. **Read the full [README](./README.md)** for detailed features
2. **Check [INTEGRATION.md](./INTEGRATION.md)** to integrate with Module 1
3. **Explore the code** to understand the architecture
4. **Customize it!** Add your own patterns, templates, etc.

---

## 🎉 Success!

You've successfully set up Module 3! 

**Questions?**
- Check [README.md](./README.md)
- Open a GitHub issue
- Contact: support@qrplatform.com

---

**Happy QR Coding!** 🎨

---

*Setup time: ~5 minutes | Difficulty: Easy | Module 3 v1.0*
