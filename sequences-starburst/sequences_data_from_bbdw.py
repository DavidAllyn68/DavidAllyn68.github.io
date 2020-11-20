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
summary = rev.groupby(by=['gift_path'])['totalrevenueamount'].sum()
summary.to_csv(')
