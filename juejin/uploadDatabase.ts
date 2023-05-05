import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type KeyFn<T> = (item: T) => any;

function uniqBy<T>(arr: T[], keyFn: KeyFn<T>): T[] {
    const seen = new Set();
    return arr.filter((item) => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
const pick = (obj: any, keys: string[]) => {
    const newObj: any = {}
    keys.forEach(i => {
        newObj[i] = obj[i]
    })
    return newObj
}


const supabase = createClient('https://wtiykjtiscarfltpprzu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aXlranRpc2NhcmZsdHBwcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODMyODExNzksImV4cCI6MTk5ODg1NzE3OX0.BhPChs3q6LDUPFutMSlwesHSMVIyJjunsTuSevJ0Opk')


for (let index = 151; index <= 180; index++) {
    const f = await Deno.open(`./data/index_${index}.jsonl`);
    const data = []
    for await (const line of readline(f)) {

        const text = new TextDecoder().decode(line)

        if (text) data.push(JSON.parse(text))
    }



    const articles = data.flatMap(i => i.data).map(i => i.item_info)
    const category = articles.flatMap(article => {
        if (!article.category) return []
        article.category.ctime = new Date(article.category.ctime * 1000)
        article.category.mtime = new Date(article.category.mtime * 1000)
        return [article.category]
    })
    const { error } = await supabase
        .from('category')
        .upsert(uniqBy(category, (i) => i.category_id))
    if (error) {
        console.log('category')
        throw error
    }


    const tags = articles.flatMap(article => {
        if (!article.tags) return []
        return article.tags.map((tag: any) => {
            tag.ctime = new Date(tag.ctime * 1000)
            tag.mtime = new Date(tag.mtime * 1000)
            return tag
        })
    })
    const { error0 } = await supabase
        .from('tag')
        .upsert(uniqBy(tags, (i) => i.tag_id))
    if (error0) { console.log('tag'); throw error }




    //User 表
    const users = articles.flatMap(article => {
        if (!article.author_user_info) return []
        return [pick(article.author_user_info, [
            "user_id",
            "user_name",
            "company",
            "job_title",
            "avatar_large",
            "level",
            "description",
            "followee_count",
            "follower_count",
            "post_article_count",
            "digg_article_count",
            "got_digg_count",
            "got_view_count",
            "post_shortmsg_count",
            "digg_shortmsg_count",
            "isfollowed",
            "favorable_author",
            "power",
            "study_point",
            "identity",
            "is_select_annual",
            "select_annual_rank",
            "annual_list_type",
            "account_amount",
            "is_vip",
            "become_author_days",
            "collection_set_article_count",
            "recommend_article_count_daily",
            "article_collect_count_daily"
        ]
        )]
    })
    const { error: error1 } = await supabase
        .from('user')
        .upsert(uniqBy(users, i => i.user_id))

    if (error1) {
        console.log("user")
        throw error1
    }


    //Article 表
    const Article = articles.flatMap(article => {
        if (!article.article_info) return []
        article.article_info.ctime = new Date(article.article_info.ctime * 1000)
        article.article_info.mtime = new Date(article.article_info.mtime * 1000)
        article.article_info.rtime = new Date(parseInt(article.article_info.rtime) * 1000)
        article.article_info.tag_ids = article.article_info.tag_ids.map(i => i.toString())

        return [pick(article.article_info, [
            "article_id",
            "user_id",
            "category_id",
            "visible_level",
            "link_url",
            "cover_image",
            "is_gfw",
            "title",
            "brief_content",
            "is_english",
            "is_original",
            "user_index",
            "original_type",
            "original_author",
            "content",
            "ctime",
            "mtime",
            "rtime",
            "draft_id",
            "view_count",
            "collect_count",
            "digg_count",
            "comment_count",
            "hot_index",
            "is_hot",
            "rank_index",
            "status",
            "verify_status",
            "audit_status",
            "mark_content",
            "display_count",
            "tag_ids",
            "is_markdown",
            "app_html_content"
        ]
        )]
    })
    const { error: error2 } = await supabase
        .from('article')
        .upsert(
            uniqBy(Article, i => i.article_id)
        )
    if (error2) {
        console.log('article')
        throw error2
    }



    f.close();
    console.log(index)
}
