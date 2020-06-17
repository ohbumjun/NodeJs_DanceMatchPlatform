import pandas as pd;

data = pd.read_excel('C:/Users/user/Desktop/Dance_Project_HD/git_home/Crawling/UnivTotal.xlsx' )

print(type(data))
print(data.head())

# Univ_df = pd.DataFrame(data, columns = ['학교종류'])
# print(Univ_df)