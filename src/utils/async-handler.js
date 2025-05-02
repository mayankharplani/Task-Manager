// BASICALLY ASYNC HANDLER JO HAI WOH TUMHARA HR JGH TRY CATCH NA LGANA PDE ISLIYE HUM BNATE HAI
// YH TUMHARE ROUTE KE CALLBACK KO LETA HAI MEANS (requestHandler) is a function as a parameter

const asyncHandler = (requestHandler) => {
    return function(req,res,next){
        Promise.resolve(requestHandler(req,res,next))
            .catch((err) => next(err))
    }
}

export {asyncHandler}