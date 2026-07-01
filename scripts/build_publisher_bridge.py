#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the TianJi Love safe publisher bridge export from the Day 014 publishing pack.

Output files (manually reviewable, no credentials, no auto-posting):
- assets/marketing/publishing-queue.json
- assets/marketing/publishing-queue.csv

Both files default every item to:
  review_status=pending_manual_review
  publish_status=not_published
and leave credential fields absent.
"""

import csv
import json
from pathlib import Path

ROOT = Path("/root/tianji-global")
OUT_DIR = ROOT / "assets" / "marketing"
OUT_DIR.mkdir(parents=True, exist_ok=True)

JSON_OUT = OUT_DIR / "publishing-queue.json"
CSV_OUT = OUT_DIR / "publishing-queue.csv"
PACK_REF = "assets/marketing/daily/day-014-publishing-pack.md"
PACK_DATE = "2026-07-01"
EXPORT_DATE = "2026-07-01"
EXPORT_BATCH_ID = "20260701-bridge-day-014"
CAMPAIGN = "revenue_os_bridge_day14"
BASE_CTA = "https://tianji.love/love-test?utm_source={src}&utm_medium=organic&utm_campaign=" + CAMPAIGN

# Use a Latin-1 safe helper to embed Chinese full-width punctuation without breaking
# the Python tokenizer (it sees only ASCII outside the literal; the literal itself
# is a unicode string and is fine once we never re-parse the script with ASCII).
def C(s):
    """Pass-through for Chinese copy. Defined as a function so the parser never
    encounters a raw full-width comma token."""
    return s


def make_item(idx, channel, content_type, title, hook, body, cta_label, notes):
    cta_url = BASE_CTA.format(src=channel)
    return {
        "id": f"{EXPORT_DATE.replace('-', '')}-{channel}-idx{idx:02d}",
        "batch_id": EXPORT_BATCH_ID,
        "date": PACK_DATE,
        "channel": channel,
        "content_type": content_type,
        "title": C(title),
        "hook": C(hook),
        "body": C(body),
        "cta": C(cta_label),
        "cta_url": cta_url,
        "utm_source": channel,
        "utm_medium": "organic",
        "utm_campaign": CAMPAIGN,
        "source_pack": PACK_REF,
        "review_status": "pending_manual_review",
        "publish_status": "not_published",
        "manual_review_required": True,
        "auto_post_eligible": False,
        "credentials_present": False,
        "published_url": "",
        "impressions": 0,
        "clicks": 0,
        "leads": 0,
        "paid_conversions": 0,
        "revenue": 0,
        "notes": C(notes),
    }


# All copy is hand-extracted from assets/marketing/daily/day-014-publishing-pack.md
items = []

# --- Xiaohongshu (5 posts) ---
items.append(make_item(
    1, "xiaohongshu", "post",
    "想发和准备好了，是两件不同的事",
    "先把问题问清楚：我是想表达，还是想被接住。",
    "很多人说“想联系他”，但很少人会接着问一句“我是想表达，还是想被接住”。这两件事看起来像同一件事，做起来差别很大。想表达的时候，内容比较稳；想被接住的时候，节奏会跟着对方跑。如果今天你也在想发那条消息，先不急着写，先想清楚你这十分钟想要的是表达还是回应。想清楚再发，比发完再焦虑简单很多。",
    "想做一次不慌的内部检查",
    "Manual publishing only; no certainty claim; no outcome guarantee",
))
items.append(make_item(
    2, "xiaohongshu", "post",
    "主动不是问题，主动背后的驱动力才是问题",
    "把循环本身写下来：你最近一次发消息，是想表达，还是想确认。",
    "关系里有一种常见的反复：想发消息 → 没发 → 后悔 → 第二天又想发。如果这个循环出现超过三次，通常不是你真的想说，是你在等一个“被接住”的信号。这种信号对方给不给，他自己可能都不知道。先把循环本身写下来：你最近一次发消息，是想表达，还是想确认？分清楚之后，再决定要不要发。",
    "想看清楚自己的循环",
    "Manual publishing only; no mind-reading claim",
))
items.append(make_item(
    3, "xiaohongshu", "post",
    "发之前先听一下身体怎么说",
    "身体信号往往比大脑更早知道你是“想表达”还是“在求接住”。",
    "当你还在写消息的时候，肩膀紧不紧、呼吸浅不浅、胃有没有在收缩？这些身体信号往往比大脑更早知道你是“想表达”还是“在求接住”。如果身体紧绷，多半是焦虑在替你写消息；如果肩膀和呼吸都还松着，那条消息大概率是从表达出发的。同一个动作，不同的状态，出来的内容会很不一样。",
    "想给情绪一个落点",
    "Manual publishing only; no diagnosis language; no shame reversal",
))
items.append(make_item(
    4, "xiaohongshu", "post",
    "不发不等于没想，发了不等于表达",
    "先不发，不丢主动；扛不住发出去，往往会进入下一轮等待。",
    "没发消息的那个晚上，可能你已经想了一百种写法。发了消息的那个晚上，可能你只是不想再循环了。这两件事都常见，也都正常。区别在于：前者是“想清楚了先不发”，后者是“扛不住先发出去”。先不发，不丢主动；扛不住发出去，往往会进入下一轮等待。把这两件事分开记录，你才看得到自己到底在循环什么。",
    "想把循环看清楚",
    "Manual publishing only; no guaranteed outcome",
))
items.append(make_item(
    5, "xiaohongshu", "post",
    "一条消息发之前，给自己留 20 分钟的空白",
    "给自己一个 20 分钟的暂停键，比事后解释简单得多。",
    "如果你今天真的在写一条消息，写完之后别立刻发。把手机放下，去喝一杯水或者做一件别的事 20 分钟。20 分钟之后回来重读一遍，如果还想发，那大概率是表达，可以发。如果回来看的时候已经不那么想发了，那可能刚才那一下是焦虑。给自己一个 20 分钟的暂停键，比事后解释简单得多。",
    "想换一个更稳的节奏",
    "Manual publishing only; no urgency tactic",
))

# --- Reels (5 short videos) ---
items.append(make_item(
    1, "tiktok_reels", "short_video",
    "想发和准备好，是两件事",
    "想联系一个人的时候，先停下来问自己：我现在是想表达，还是想被接住。",
    "想联系一个人的时候，先停下来问自己：我现在是想表达，还是想被接住？想表达的时候内容是稳的；想被接住的时候节奏会跟着对方跑。同样的动作，不同的状态，出来的内容会差很远。先看清你要的是哪一个，再决定要不要发。",
    "了解更多",
    "Manual publishing only; no auto-posting",
))
items.append(make_item(
    2, "tiktok_reels", "short_video",
    "主动不是问题，盲目的主动才是消耗",
    "能接受不回复的时候再发，才是真的准备好了。",
    "主动联系一次不丢人。丢掉判断力的主动才是消耗。一个简单的判断方法：你能接受对方不回复吗？如果能，发出去就不会后悔。如果不能，先放一放。能接受不回复的时候再发，才是真的准备好了。",
    "了解更多",
    "Manual publishing only; no chase tactic",
))
items.append(make_item(
    3, "tiktok_reels", "short_video",
    "写完消息先别发",
    "给自己一个暂停键，比事后解释简单。",
    "写完一条消息之后，给自己 20 分钟。放下手机，喝杯水，或者做一件别的。20 分钟之后回来重读，如果还想发，那是表达；如果回看的时候已经不那么想发，刚才那一下大概率是焦虑。给自己一个暂停键，比事后解释简单。",
    "了解更多",
    "Manual publishing only; no pressure tactic",
))
items.append(make_item(
    4, "tiktok_reels", "short_video",
    "没发不等于没想",
    "先看清自己是哪一种，再决定下一步。",
    "不发消息的那个晚上，你可能已经想了一百种写法。这不是没想，是在给自己留空间。发了消息的那个晚上，可能你只是不想再循环了。这两种情况都常见，但前者是主动选择，后者是扛不住。先看清自己是哪一种，再决定下一步。",
    "了解更多",
    "Manual publishing only; no certainty claim",
))
items.append(make_item(
    5, "tiktok_reels", "short_video",
    "身体比大脑先知道",
    "身体松着发出去的内容，比较稳。",
    "发消息之前，先听一下身体怎么说。肩膀紧不紧？呼吸浅不浅？胃有没有在收缩？这些信号比“想清楚了吗”更直接。如果身体紧绷，多半是焦虑在替你写；如果肩膀和呼吸都还松着，那条消息大概率是从表达出发的。同一个动作，不同的状态，结果差很远。",
    "了解更多",
    "Manual publishing only; no diagnosis language",
))

# --- X / Twitter (5 posts) ---
items.append(make_item(
    1, "twitter_x", "short_post",
    "想发和准备好了，是两件不同的事",
    "一个是表达，一个是求接住。",
    "想发和准备好了，是两件不同的事。一个是表达，一个是求接住。分清楚再发，比发完再焦虑简单。",
    "开始一次私密检查",
    "Manual publishing only; manual-review required",
))
items.append(make_item(
    2, "twitter_x", "short_post",
    "主动不是问题，盲目的主动才是消耗",
    "你能接受对方不回复吗？",
    "主动不是问题，盲目的主动才是消耗。判断方法很简单：你能接受对方不回复吗？不能，就先放一放。",
    "看关系循环",
    "Manual publishing only; manual-review required",
))
items.append(make_item(
    3, "twitter_x", "short_post",
    "写完消息先别发",
    "回看时已经不想发，那是焦虑。",
    "写完消息先别发，给自己 20 分钟。回看的时候还想发，那是表达；回看时已经不想发，那是焦虑。",
    "开始一次私密检查",
    "Manual publishing only; manual-review required",
))
items.append(make_item(
    4, "twitter_x", "short_post",
    "不发不等于没想，发了不等于表达",
    "前者是主动留空间，后者是扛不住。",
    "不发不等于没想，发了不等于表达。前者是主动留空间，后者是扛不住。先看清自己在哪一种。",
    "看清自己的循环",
    "Manual publishing only; manual-review required",
))
items.append(make_item(
    5, "twitter_x", "short_post",
    "发消息之前先听一下身体怎么说",
    "身体松着发出去的内容，比较稳。",
    "发消息之前先听一下身体怎么说。肩膀紧、呼吸浅、胃收缩 —— 多半是焦虑在替你写。身体松着发出去的内容，比较稳。",
    "给情绪一个落点",
    "Manual publishing only; manual-review required",
))

# --- Reddit / Quora (3 posts) ---
items.append(make_item(
    1, "reddit_quora", "answer_draft",
    "How do you tell the difference between wanting to reach out and actually being ready to send a message?",
    "Drafting messages, deleting them, drafting them again. Is there a way to tell the difference?",
    "I keep going back and forth about messaging someone I care about. I draft messages, delete them, draft them again, then go to bed and repeat the next day. Some days I really want to reach out because I have something to say. Other days I just want to feel caught by their reply. Is there a way to tell the difference before I send? I don't want to keep confusing anxiety for intention. Not asking for predictions — just want to understand how to name what's actually driving the urge to send.",
    "Optional private relationship reading",
    "Manual publishing only; no auto-posting; no platform bypass",
))
items.append(make_item(
    2, "reddit_quora", "answer_draft",
    "Is it normal that I draft messages to my ex every night and never send them?",
    "The loop feels less like processing and more like rehearsal.",
    "It's been a few weeks since we stopped talking. Almost every night I open the chat, write something, read it back, and close the app without sending. I tell myself I'm just processing. But the loop is starting to feel less like processing and more like rehearsal for a message I might send on a bad day. Is this just a stage of letting go, or am I keeping the loop alive by writing without sending? Curious how others separated the urge to write from the actual readiness to send.",
    "Optional private check-in",
    "Manual publishing only; no auto-posting",
))
items.append(make_item(
    3, "reddit_quora", "answer_draft",
    "How do you know when sending a message is an act of expression vs. an act of seeking reassurance?",
    "Expressive messages are calm, reassurance-seeking ones are longer and more anxious.",
    "I've been thinking about the difference between reaching out because I have something to say vs. reaching out because I want to feel held by their reply. I notice my own messages change tone depending on which one is true — expressive messages are calm, reassurance-seeking ones tend to be longer, more justifying, and more anxious. How do other people tell the difference in the moment, not just in hindsight? Not looking for a verdict on my situation — just want a framework I can use before I send.",
    "Optional private check-in",
    "Manual publishing only; no auto-posting",
))

# --- KOL (2 pieces) ---
items.append(make_item(
    1, "kol_dm", "dm_draft",
    "A small question to ask before you send that message",
    "Expression vs. reassurance — a different starting point for the next post.",
    "Hey [Name], wanted to share a thought that might resonate with your community: before sending that next message, try one question — am I looking to express, or am I looking to feel caught? They're different. Expression starts from inside and lands wherever it lands. Reassurance is something only the other person can give, and they may not even know you need it. The Love Test at /love-test is a private way to slow down and check the motive before sending. No prediction, no verdict — just a calmer way to look at the pattern. Would love to hear your take.",
    "Review draft only",
    "Manual publishing only; no auto-DM; manual review required",
))
items.append(make_item(
    2, "kol_dm", "post_draft",
    "The moment you press send matters as much as what you wrote",
    "Can you genuinely be okay if they don't reply?",
    "One of the clearest signs you're sending from expression vs. from anxiety: can you genuinely be okay if they don't reply? If yes — the message is yours, send it. If no — the message is a request, and that request will turn into another wait. A private Love Test isn't about predicting what they'll do. It's about helping you name what you actually want from sending it.",
    "Review draft only",
    "Manual publishing only; manual review required",
))

# --- SEO (3 articles) ---
items.append(make_item(
    1, "seo_outline", "seo_outline",
    "Wanting to Reach Out vs. Being Ready to Send: A Simple Distinction",
    "Target keyword: wanting to reach out but not ready",
    "Standard SEO structure — intro, definition of want vs. readiness, self-assessment questions, body-state check, the 20-minute pause method, when a private Love Test can help, CTA to /love-test. No guaranteed outcomes language.",
    "Start a private reading",
    "Manual publishing only; no auto-publish; no guaranteed outcome",
))
items.append(make_item(
    2, "seo_outline", "seo_outline",
    "How to Tell If You're Sending a Message to Express or to Be Caught",
    "Target keyword: am I reaching out for reassurance",
    "Standard SEO structure — intro, the two motives, language patterns to watch for, body cues, what a calm message feels like, when a private check-in helps, CTA to /love-test.",
    "Ask one focused question",
    "Manual publishing only; no auto-publish; no shame reversal",
))
items.append(make_item(
    3, "seo_outline", "seo_outline",
    "The 20-Minute Pause: A Simple Trick Before Sending an Emotional Message",
    "Target keyword: pause before sending emotional message",
    "Standard SEO structure — intro, why drafting and sending feel different, the 20-minute pause method, what changes after the pause, when to send and when not to, CTA to /love-test.",
    "Get a calmer next step",
    "Manual publishing only; no auto-publish; no urgency language",
))

# Channel summary
channel_counts = {}
for it in items:
    channel_counts[it["channel"]] = channel_counts.get(it["channel"], 0) + 1

payload = {
    "export_date": EXPORT_DATE,
    "export_batch_id": EXPORT_BATCH_ID,
    "source_pack": PACK_REF,
    "pack_publishing_date": PACK_DATE,
    "theme": "Initiation in ambiguity — wanting to reach out is not the same as being ready to send",
    "primary_hook": "Wanting to reach out is not the same as being ready to send.",
    "primary_cta_path": "/love-test",
    "default_review_status": "pending_manual_review",
    "default_publish_status": "not_published",
    "credential_fields_absent": True,
    "auto_posting_enabled": False,
    "manual_review_required": True,
    "future_adapter_targets": ["n8n", "Postiz", "Mixpost"],
    "future_adapter_status": "not_approved",
    "channel_counts": channel_counts,
    "item_count": len(items),
    "items": items,
}

with JSON_OUT.open("w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
    f.write("\n")

csv_fields = [
    "id", "date", "channel", "content_type", "title", "hook", "body",
    "cta", "cta_url", "utm_source", "utm_medium", "utm_campaign",
    "review_status", "publish_status", "published_url", "impressions",
    "clicks", "leads", "paid_conversions", "revenue", "notes",
]
with CSV_OUT.open("w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=csv_fields, quoting=csv.QUOTE_MINIMAL)
    w.writeheader()
    for it in items:
        row = {k: it.get(k, "") for k in csv_fields}
        for num in ("impressions", "clicks", "leads", "paid_conversions", "revenue"):
            row[num] = it.get(num, 0)
        w.writerow(row)

print(f"WROTE {JSON_OUT} ({len(items)} items)")
print(f"WROTE {CSV_OUT} ({len(items)} items)")
print("CHANNEL COUNTS:", channel_counts)
