module.exports = cds.service.impl( async function(){

    //Step 1: get the object of our odata entities
    const { PurchaseOrder, EmployeeSet, PurchaseOrderItems } = this.entities;

    this.on('boost', async (req,res) => {
        try {
            const ID = req.params[0];
            console.log("Hey Amigo, Your purchase order with id as" + req.params[0].NODE_KEY+ " will be boosted");
            const tx = cds.tx(req);
            await tx.update(PurchaseOrder).with({
                GROSS_AMOUNT: { '+=' : 20000 },
                NOTE: 'Boosted!!'
            }).where(ID);
        } catch (error) {
            return "Error " + error.toString();
        }
    });

    this.before('CREATE', EmployeeSet, (req,res) => {
        console.log("Aa gaya " + req.data.salaryAmount);
        if(parseFloat(req.data.salaryAmount) >= 1000000){
            req.error(500, "Salary must be less than a million for employee");
        }
    });

    this.on('getOrderDefaults', async req => {
       return {OVERALL_STATUS : 'N'};
    });
   
    this.on('setOrderProcessing',PurchaseOrder, async req => {
          const tx = cds.tx(req);
          await tx.update(PurchaseOrder, req.params[0].ID).set({OVERALL_STATUS:'D'});
    });

    this.on('largestOrder', async (req,res) => {
        try {
            //const ID = req.params[0];
            const tx = cds.tx(req);
            
            //SELECT * UPTO 1 ROW FROM dbtab ORDER BY GROSS_AMOUNT desc
            const reply = await tx.read(PurchaseOrder).orderBy({
                GROSS_AMOUNT: 'desc'
            }).limit(1);

            return reply;
        } catch (error) {
            return "Error " + error.toString();
        }
    });
})