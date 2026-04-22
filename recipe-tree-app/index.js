const port = process.env.PORT || 8080; // これが重要！
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});