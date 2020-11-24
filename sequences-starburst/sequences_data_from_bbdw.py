# -*- coding: utf-8 -*-
"""
Created on Fri Nov 20 10:30:33 2020

@author: dallyn
"""

import pyDave.toolbox as tbx
bbdw = tbx.bbdw_connect()
#%%
cols =[
       'revenuelookupid',
       'schoolname',
       'divisionname',
       'departmentname',
       'designationpublicname',
       'totalrevenueamount'
       ]
rev = bbdw.revenue_to_dataframe(fiscalyears=[2021])
rev.columns = rev.columns.str.lower()
#%%
rev['gift_path'] = rev['schoolname'] + '-' + rev['divisionname'] + '-' + rev['departmentname'] + '-' + rev['designationpublicname']

#%%
sequences = rev.groupby(by=['gift_path'])['totalrevenueamount'].sum()
sequences.to_csv('sequences.csv')
#%%
schools = rev['schoolname'].unique().tolist()
colors = ["#e6bbb2",
        "#e6bb9b",
        "#d5c5a1",
        "#c9d2a8",
        "#ced3be",
        "#daf4c5",
        "#aed0a0",
        "#acd8ba",
        "#9db7b1",
        "#72c8b8",
        "#c6e1db",
        "#a1d8cd",
        "#94d9df",
        "#add4e0",
        "#7cd3eb",
        "#99ceeb",
        "#a1bde6",
        "#d5d2e7",
        "#b3b0c4",
        "#cab8e5",
        "#e9b4cb",
        "#e0c7ce"]

school_colors = dict(zip(schools,colors))
#%%
text = """,
""".join(['"' + i + '":"' + school_colors[i] + '"' for i in school_colors])

print("var colors = {",text,"}")