const express=require('express');
const router=express.Router();

router.get('/:id', async (req, res)=>{
    const bookId=req.params.id;
    try{
        const currentBookResponse=await fetch(`https://gutendex.com/books/${bookId}`);
        const bookData=await currentBookResponse.json();

        const moreBooksResponse=await fetch('https://gutendex.com/books');
        const moreBooksData=await moreBooksResponse.json();

        const similarBooks=moreBooksData.results.filter(b=>b.id.toString()!==bookId.toString()).slice(0, 5);

        res.render('bookDetails', { 
            book : bookData,
            similarBooks : similarBooks
        });
    } catch(error){
        res.send('Error loading book detail.');
    }
});

module.exports=router;