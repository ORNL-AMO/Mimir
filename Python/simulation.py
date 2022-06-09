#Need Pip install xlrd, pandas (optional), pyserial, numpy
import xlrd
import pandas as pd
import serial
import serial.tools.list_ports
import usb.core
import random
import time
import glob

def getFile():
    file_path = 'TTUPumpData.xlsx'

    data = pd.read_excel(file_path, 'Condition 1')
    #data = pd.read_excel(file_path,  'Condition 2')

    timestamp = data[data.columns[0]].values #time
    pressure = data[data.columns[1]].values #psig
    flowRate = data[data.columns[2]].values #gpm
    motorPower = data[data.columns[3]].values #kw
    
    ser = serial.Serial(
    
		port='/dev/ttyAMA0',
		baudrate = 9600,
		parity = serial.PARITY_NONE,
		stopbits = serial.STOPBITS_ONE,
		bytesize = serial.EIGHTBITS,
		timeout = 1
	)
		
    #while(1):
        #print(random.choice(flowRate))
        #time.sleep(3)
    
    

     


if __name__ == "__main__":
    getFile()    
    
