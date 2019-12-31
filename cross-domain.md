## 跨域问题（非同源策略请求）

- JSONP跨域解决方案的底层原理

- CORS跨域资源共享

- 基于Http proxy实现跨域请求

- 基于post message实现跨域处理

- 基于iframe的跨域解决方案

  window.name/document.domin/location.hash

- web scoket 和nginx 反向代理

**区分同源和跨域**

​	三者都一样就是同源，只要有一个不同就是跨域

- 协议
- 域名
- 端口号



## 同源策略请求

部署到同一个web服务器上： 同源策略

## 跨域传输

### JSONP跨域解决方案的底层原理

- script 
- img
- link
- iframe

不存在跨域请求的限制

是基于Script中的src解决跨域的问题，中携带一个callback=func。向服务器发请求，同时会把本地的一个函数传递给服务器。服务器接收到客户端的请求，（callback=func）此时要准备数据 data = {...}

给客户端返回数据func（Json.stringify（data））

**问题**

JSOP只能处理的是GET请求

有可能数据劫持（不安全）

### CORS跨域资源共享

- 客户端（发送ajax/fetch请求）
- 服务端设置相关的头信息（需要处理option试探性请求）

**问题**

设置允许的源为*的时候就不行携带cookie

### http proxy 

webpack webpack-dev-serve 进行代理

### nginx反向代理

![1571984500577](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1571984500577.png)



### postMessage

![1571985853352](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1571985853352.png)



### h5里面提供的web scoket

利用webscoket里面的scoket.io 解决跨域的问题

![1571986144941](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1571986144941.png)

![1571986319211](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1571986319211.png)



### 基于iframe

**dcoument.domain + iframe**

只能实现同一个主域，不同的子域的操作

**window.name + iframe**

**location.hash+ iframe**



