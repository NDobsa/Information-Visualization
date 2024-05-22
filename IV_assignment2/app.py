from flask import Flask, render_template, request
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

app = Flask(__name__)

# ensure that we can reload when we change the HTML / JS for debugging
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True


@app.route('/')
def data():
    # replace this with the real data
    testData = ["hello", "infovis", "2024"]

    # return the index file and the data
    return render_template("index.html", data=json.dumps(testData))

#@app.route("/data")
#def index():
#    df_team = pd.read_csv("./static/data/df_agg_team.csv")
#    df_team = df_team.to_json()
#    df_player = pd.read_csv("./static/data/df_agg_player.csv")
#    df_player = df_player.to_json()
#    df_stats = pd.read_csv("./static/data/cleaned_df_player_stats.csv")
#    df_stats = df_stats.to_json()
####   result = pca(df)
###    #return render_template("index.html", **locals())
#    return render_template("index.html", data=json.dumps(df_stats))
###    #return render_template("index.html",  data=df.head(5).to_html())

#@app.route('/')
@app.route('/data_show')
@app.route('/data')
def datasets():
    df_team = pd.read_csv("./static/data/df_agg_team.csv", index_col="Team Name")
    df_player = pd.read_csv("./static/data/df_agg_player.csv")
    df_stats = pd.read_csv("./static/data/cleaned_df_player_stats.csv")
    if request.path == '/data_show':
        df1 = df_team.to_json()
        df1 = df_player.to_json()
        df3 = df_stats.to_json()
        return render_template("index.html", data=json.dumps(df1))
    return df_team, df_player, df_stats

@app.route('/pca_show')
@app.route('/pca')
def pca():
    df_team = datasets()[0]
    df_team = df_team.loc[df_team.index != "retired", :] # excluding retired
    df_pca = df_team.loc[:, df_team.columns != 'Team ID']
    # scaling
    scaler = StandardScaler()
    df_pca = scaler.fit_transform(df_pca)
    # PCA
    pca = PCA()
    components = pca.fit_transform(df_pca)
    pca_plot_df = pd.DataFrame(components, index = df_team.index)
    pca_plot_df = pca_plot_df.iloc[:, 0:2]
    pca_plot_df.columns = ["PC1", "PC2"]
    pca_plot_df["Team"] = pca_plot_df.index
    show_pca_df = pca_plot_df.to_json()
    if request.path == '/pca_show':
        return render_template("index.html", data=json.dumps(show_pca_df))
    return pca_plot_df.to_csv()

@app.route('/long')
def long():
    df_team = datasets()[0]
    df_team = df_team.loc[df_team.index != "retired", :]  # excluding retired
    df_team = df_team.loc[:, df_team.columns != 'Team ID']

    # min max scaling
    scaler = MinMaxScaler()
    minmax = scaler.fit_transform(df_team)
    minmax = pd.DataFrame(minmax)
    minmax.columns = df_team.columns

    df_team["team"] = df_team.index
    long = pd.melt(df_team, id_vars=["team"], value_vars=df_team.columns[2:])
    minmax["team"] = df_team.index
    long_mm = pd.melt(minmax, id_vars=['team'], value_vars=minmax.columns[2:], value_name="color")

    merged = pd.concat([long, long_mm], axis=1)
    merged = merged.loc[:, ~merged.columns.duplicated()]

    return merged.to_csv()

@app.route('/lineplot')
def lineplot():
    df_stats = datasets()[2]
    df_stats = df_stats.loc[df_stats.team_name != "retired", :]

    return df_stats.to_csv()

@app.route('/selection')
def selection():
    df = datasets()[2]
    selection_list = df.columns[5:]

    return selection_list.tolist()

if __name__ == '__main__':
    app.run(debug=True)
    #app.run()


#from flask import Flask, request, render_template
#import pandas as pd

#app = Flask(__name__)


