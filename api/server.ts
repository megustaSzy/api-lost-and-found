import app from "./src/index";


const PORT = process.env.PORT || 3001;


app.listen(PORT, () => {
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
});