import Hashtag from '../models/hashtag.model.js'



export const trending_Hashtags = async (req, res, next) => {
    // **1- Fetch all hashtags
    // 2- Count the number of posts associated with that hashtag
    // 3- Sort the hashtags in descending order according to post count
    try {
        const all_Hashtags = await Hashtag.aggregate([
          {
            $project: {
              hashWord: 1,
              posts: 1,
              postsCount: { $size: "$posts" },
            },
          },
          {
            $sort: { postsCount: -1 },
          },
        ]);

        res.status(201).json({
            msg: 'Trending Posts',
            all_Hashtags
        })

    } catch (error) {
        next(error)        
    }
}



