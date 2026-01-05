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
       
        
    


        
