let { net } = require('electron').remote

module.exports = {
    startDate: '2019-08-01',
    endDate: '2019-08-08',
    nameArr: ['杨智富','卢仕幸','杨振烈','黄惠林','陈志东','赖彬','郭伯豪','莫燕红','张育铭','韦文耐','白若男'],
    D: {
        'table': document.querySelector('.main-cnt-time').querySelector('table')
    },
    init() {
        this.ajaxData()
    },
    ajaxData() {
        const S = this
        let data = []
        let request = net.request(`http://172.16.4.2/api/spent_on_tasks?dept=前端开发平台&from=${S.startDate}&to=${S.endDate}`)
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                data.push(chunk)
            })
            response.on('end', () => {
                S.createList(data && JSON.parse(data.join('')))
            })
        })
        request.end()     
    },
    createList(data) {
        const S = this
        console.log(JSON.stringify(data))
        if(data && data.rows.length > 0){
            // 重新组装数据结构
            let tableCols = {}
            let tableRows = {}
            let dayArr = []
            data.rows.forEach((item,index) => {
                // var day = item.created_time.split(' ')[0]
                var day = item.work_day
                if(!tableCols[day]){
                    tableCols[day] = {
                        work_day: day,
                        week_n: item.week_n
                    }
                    dayArr.push(day)
                }
                if (S.nameArr.indexOf(item.name) != -1) {
                    let keyStr = item.name
                    if(!tableRows[keyStr]){
                        tableRows[keyStr] = {}
                        tableRows[keyStr]['data'] = [item]
                    }else{
                        tableRows[keyStr]['data'].push(item)
                    }
                }
            })

            // console.log(tableCols)
            console.log(tableRows)

            // 按日期升序排序
            dayArr = dayArr.sort((a, b) => {
                return a.replace(/-/g,'') - b.replace(/-/g,'')
            })
            let sortTableCols = {}
            dayArr.map((item) => {
                let formtItem = item.replace(/-/g,'')
                let startDate = S.startDate.replace(/-/g,'')
                let endDate = S.endDate.replace(/-/g,'')
                if(formtItem >= startDate && formtItem <= endDate){
                    sortTableCols[item] = tableCols[item]
                }
            })               
            // 绘制表头
            let tr = '<th>开发人员</th>'
            for(let i in sortTableCols){
                tr += `<th><div>${S.formatWeek(sortTableCols[i].week_n)}</div><div>${sortTableCols[i].work_day}</div></th>`
            }
            tr += '<th>总计</th>'
            

            // 绘制td
            let td = ''
            let timeArr = []
            let sortTableRows = {}
            for(let i in tableRows){
                sortTableRows[i] = {}
                sortTableRows[i]['name'] = i
                sortTableRows[i]['daylist'] = []
                let totalTime = 0
                for(let k in sortTableCols){
                    let time = 0
                    tableRows[i].data.forEach((item) => {
                        // var day = item.created_time.split(' ')[0]
                        var day = item.work_day
                        if(day == k){
                            time += item.spend_hours
                        }
                    })
                    totalTime += time
                    time = time ? parseFloat(time.toFixed(2)) : ''
                    sortTableRows[i]['daylist'].push(time)
                }
                totalTime = parseFloat(totalTime.toFixed(2))
                sortTableRows[i]['totalTime'] = totalTime
                timeArr.push(totalTime)
            }

            // 按工时倒序排序
            timeArr = timeArr.sort((a, b) => {
                return b - a
            })
            timeArr.map((item) => {
                for(let i in sortTableRows){
                    if(item == sortTableRows[i]['totalTime']){
                        td += '<tr>'
                        td += `<td>${sortTableRows[i]['name']}</td>`
                        sortTableRows[i]['daylist'].map((item) => {
                            td += `<td>${item}</td>`
                        })
                        td += `<td>${sortTableRows[i]['totalTime']}</td>`
                        td += '</tr>'
                    }
                }
            })

            // 插入数据
            S.D.table.innerHTML = tr + td
        }
    },
    formatWeek(num) {
        let str = ''
        switch(num){
            case 2:
                str = '星期一'
                break;
            case 3:
                str = '星期二'
                break;
            case 4:
                str = '星期三'
                break;
            case 5:
                str = '星期四'
                break;
            case 6:
                str = '星期五'
                break;
            case 7:
                str = '星期六'
                break;
        }
        return str
    },
}