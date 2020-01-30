frappe.ui.form.on("Sales Order", "refresh", function(frm) {
    var role = "SO Reviewer";
    var role_creator = "SO Creator";
    var check_role = get_roles(frappe.session.user, role);
    var check_role_creator = get_roles(frappe.session.user, role_creator);
    //var removed_perm = remove_submit_permission(frappe.session.user);
    

    if (cur_frm.doc.docstatus == 0) {
        /*frm.add_custom_button(__("Make Document Review"), function() {
	frappe.model.open_mapped_doc({
            method: "nhance.nhance.doctype.document_review_details.document_review_details.make_document_review_detials",
            frm: cur_frm
        })
	
	});*/

        frm.add_custom_button(__("Make Sales Order Review"), function() {
            if (check_role_creator != "" && check_role_creator != undefined) {
                frappe.model.open_mapped_doc({
                    method: "nhance.nhance.doctype.sales_order_review.sales_order_review.make_document_review_detials",
                    frm: cur_frm
                })
            }
		else if (check_role != "" && check_role != undefined) {
                frappe.model.open_mapped_doc({
                    method: "nhance.nhance.doctype.sales_order_review.sales_order_review.make_document_review_detials",
                    frm: cur_frm
                })
            } else {
                frappe.msgprint("Access Rights Error! You do not have permission to perform this operation!");
            }
        });
    }
  
    if (cur_frm.doc.under_review == 1) {
        var fields_name = get_fields(cur_frm.doc.doctype);
        var item_fields = "";
        var tax_fields = "";
        var payment_fields = "";
        for (var pf = 0; pf < fields_name.length; pf++) {
            cur_frm.set_df_property(fields_name[pf].fieldname, "read_only", 1);

            if (fields_name[pf].fieldname == "items") {
                var child_field = fields_name[pf].options;
                item_fields = get_fields(child_field);
            } else if (fields_name[pf].fieldname == "taxes") {
                var child_field = fields_name[pf].options;
                tax_fields = get_fields(child_field);
            } else if (fields_name[pf].fieldname == "payment_schedule") {
                var child_field = fields_name[pf].options;
                payment_fields = get_fields(child_field);
            }
        }
        for (var itm_f = 0; itm_f < item_fields.length; itm_f++) {
            cur_frm.fields_dict.items.grid.toggle_enable(item_fields[itm_f].fieldname, false);

        }

        for (var tf = 0; tf < tax_fields.length; tf++) {
            cur_frm.fields_dict.taxes.grid.toggle_enable(tax_fields[tf].fieldname, false);

        }
        for (var pf = 0; pf < payment_fields.length; pf++) {
            cur_frm.fields_dict.payment_schedule.grid.toggle_enable(payment_fields[pf].fieldname, false);

        }
    } else if (cur_frm.doc.under_review == 0) {
        var fields_name = get_fields(cur_frm.doc.doctype);
        var item_fields = "";
        var tax_fields = "";
        var payment_fields = "";
        for (var pf = 0; pf < fields_name.length; pf++) {
            cur_frm.set_df_property(fields_name[pf].fieldname, "read_only", 0);

            if (fields_name[pf].fieldname == "items") {
                var child_field = fields_name[pf].options;
                item_fields = get_fields(child_field);
            } else if (fields_name[pf].fieldname == "taxes") {
                var child_field = fields_name[pf].options;
                tax_fields = get_fields(child_field);
            } else if (fields_name[pf].fieldname == "payment_schedule") {
                var child_field = fields_name[pf].options;
                payment_fields = get_fields(child_field);
            }
        }
        for (var itm_f = 0; itm_f < item_fields.length; itm_f++) {
            cur_frm.fields_dict.items.grid.toggle_enable(item_fields[itm_f].fieldname, true);

        }

        for (var tf = 0; tf < tax_fields.length; tf++) {
            cur_frm.fields_dict.taxes.grid.toggle_enable(tax_fields[tf].fieldname, true);

        }
        for (var pf = 0; pf < payment_fields.length; pf++) {
            cur_frm.fields_dict.payment_schedule.grid.toggle_enable(payment_fields[pf].fieldname, true);

        }
    } else {
        cur_frm.refresh_fields();
    }
 
    cur_frm.set_query("control_bom", "items", function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        var bom_list = [];
        console.log("Item Code:: " + d.item_code);
        frappe.call({
            method: "nhance.api.get_bom_list_for_so",
            args: {
                "item_code": d.item_code,
            },
            async: false,
            callback: function(r) {
                console.log("Length" + r.message.length);
                console.log("bom_list :" + bom_list);
                for (var i = 0; i < r.message.length; i++) {
                    console.log("r.message::" + r.message[i].name);
                    bom_list.push(r.message[i].name);
                    console.log("bom_list" + bom_list);
                }
            }
        });

        return {
            "filters": [
                ["BOM", "name", "in", bom_list]
            ]
        }

        refresh_field("control_bom");
        refresh_field("items");
    });

});
frappe.ui.form.on("Sales Order", "before_submit", function(cdt, cdn, frm) {
    //var removed_perm = remove_submit_permission(frappe.session.user,cur_frm.doc.name);
   /* if (cur_frm.doc.under_review == 1){
    	frappe.throw("Sales Order is under Review Please submit first document review details");
    	//frappe.validation = false;
    }
    var role_reviewer = "SO Reviewer";
    var role_creator = "SO Creator";
    var role_overwriter = "SO Overwrite";

    var check_role_for_review = get_roles(frappe.session.user, role_reviewer);
    var check_role_for_creator = get_roles(frappe.session.user, role_creator);
    var check_role_for_overwrite = get_roles(frappe.session.user, role_overwriter);
    var review_templates = get_review_templates(cur_frm.doc.doctype);
    var check_sales_order_review = get_sales_order_review(cur_frm.doc.name);
    var fields_name = get_fields(cur_frm.doc.doctype);
    var doctype_name = "Sales Order Review";
    var review_doc_field = get_fields(doctype_name);
   
    if (check_sales_order_review.length != 0) {
	 var status = check_sales_order_review[0].docstatus;
        if (check_role_for_review != "" && check_role_for_review != undefined) {
            var status = check_sales_order_review[0].docstatus;
            if (status == 1) {
                get_check_before_submit(cur_frm.doc.doctype, cur_frm.doc.name);
            } else {
                frappe.throw("please first submite Sales order Review " + check_sales_order_review[0].name);
            }
        } else if (check_role_for_creator != "" && check_role_for_creator != undefined) {
            var status = check_sales_order_review[0].docstatus;
            if (status == 1) {
                get_check_before_submit(cur_frm.doc.doctype, cur_frm.doc.name);
            } else {
                frappe.throw("please first submite Sales order Review " + check_sales_order_review[0].name);
            }
        } else if (check_role_for_overwrite != "" && check_role_for_overwrite != undefined) {

            frappe.throw("Dear user "+ frappe.user + " you don't have permission " + '"' + role_overwriter + '"' + "to ignore sales order review " + check_sales_order_review[0].name);
        } else {
            frappe.throw("please first submite Sales order Review " + check_sales_order_review[0].name);
        }
    }
*/

})

function get_roles(user, role) {
    var purchase = "";
    frappe.call({
        method: "nhance.nhance.doctype.sales_order_review.sales_order_review.get_roles",
        args: {
            "user": user,
            "role": role
        },
        async: false,
        callback: function(r) {
            if (r.message.length > 0) {

                purchase = r.message[0].role;
            }
        }
    });
    return purchase;


}

function get_fields(doctype) {
    var fields = "";
    frappe.call({
        method: 'nhance.nhance.doctype.sales_order_review.sales_order_review.get_doc_details',
        args: {
            "doctype": doctype
        },
        async: false,
        callback: function(r) {
            fields = r.message;
        }
    });
    return fields;
}

function get_sales_order_review(name) {
    var sales_order_review = "";
    frappe.call({
        method: "nhance.nhance.doctype.sales_order_review.sales_order_review.get_sales_order_review",
        args: {
            "name": name
        },
        async: false,
        callback: function(r) {
            if (r.message) {

                sales_order_review = r.message
            }
        }
    });
    return sales_order_review;

}

function get_review_templates(doctype) {
    var doc_details = "";
    frappe.call({
        method: 'nhance.nhance.doctype.sales_order_review.sales_order_review.get_review_templates',
        args: {
            "doctype": doctype

        },
        async: false,
        callback: function(r) {
            doc_details = r.message;
        }
    });
    return doc_details;
}

function get_check_before_submit(doctype, name) {
    var doc_details = "";
    frappe.call({
        method: 'nhance.nhance.doctype.sales_order_review.sales_order_review.get_check_before_submit',
        args: {
            "doctype": doctype,
            "name": name

        },
        async: false,
        callback: function(r) {
            doc_details = r.message;
        }
    });
    return doc_details;
}
function remove_submit_permission(user,name){
	 var remove_perm = "";
	    frappe.call({
		method: 'nhance.nhance.doctype.sales_order_review.sales_order_review.remove_submit_permission',
		args: {
		    "user": user,
		    "name":name
		},
		async: false,
		callback: function(r) {
		    remove_perm = r.message;
		}
	    });
	    return remove_perm;
}

