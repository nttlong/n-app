
const Sequelize = require('sequelize');
// Or you can simply use a connection uri
var sequelize=undefined;
/**
 * set connection string
 * @param {*} config 
 */
var setConfig=(config,callback)=>{
    return require("../q-sync").exec(
        cb=>{
            sequelize = new Sequelize(config);
            sequelize
            .authenticate()
            .then(() => {
                cb(null,sequelize);
            })
            .catch(err => {
                cb(err)
            });
        },callback,
        __filename
    )
    
};

module.exports={
    setConfig:setConfig,
    sequelize:()=>{
        return sequelize;
    }
}
