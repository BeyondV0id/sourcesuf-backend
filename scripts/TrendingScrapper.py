from bs4 import BeautifulSoup
import requests


def get_trending_repos(language="", since="daily"):
    URL = "https://github.com/trending"
    print(f"Scraping {language if language else 'all languages'} and from {since}")
    if language:
        URL += f"/{language}"
    params = {"since": since}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(URL, params=params, headers=headers)
        response.raise_for_status()

    except Exception as e:
        print(f"Failed to fetch Github page :{e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    repos = []

    for row in soup.find_all("article", class_="Box-row"):
        title_tag = row.find("h2", class_="h3")
        a_tag = title_tag.find("a")
        title = a_tag.get_text(strip=True)
        owner, repo = title.split("/")

        stats_div = row.find("div", class_="f6 color-fg-muted mt-2")
        links = stats_div.find_all("a")
        stars = links[0].get_text(strip=True)
        forks = links[1].get_text(strip=True)
        spans = stats_div.find_all("span")
        stars_earned = spans[-1].get_text(strip=True)

        repos.append({
            "owner":owner,
            "repo":repo,
            "stargazers":stars,
            "forks":forks,
            "stars_earned":stars_earned
            })
    return repos

def push_trending_repos(repos,category):
    BACKEND_URL = "http://localhost:3000/api/webhooks/sync-trending"
    SECRET_KEY = "abce"

    if not repos:
        print("No repos to send.")
        return
    
    print(f"Sending {len(repos)} repos of category: {category}")

    jsonData = {
        "repos":repos,
        "category":category
    }

    headers = {
        "Content-Type": "application/json",
        "x-admin-secret": SECRET_KEY
    }

    try:
        data = requests.post(BACKEND_URL,json=jsonData,headers=headers)
        if data.status_code == 200:
            print(f"Data send successfully")
        else:
            print(f"Failed : {repo.status_code}")

    except Exception as e:
        print(f"Connection Error: {e}")


if __name__ = "__main__":

    daily_data = get_trending_repos(since='daily')
    push_trending_repos(daily_data,category='trending-daily')

    weekly_data = get_trending_repos(since='weekly')
    push_trending_repos(daily_data,category='trenidng-weekly')

    monthly_data = get_trending_repos(since='monthyl')
    push_trending_repos(daily_data,category='trenidng-monthly')

