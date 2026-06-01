namespace MuseumManagmentSystem.Entities
{
    public class Fund
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public int  PartnerID {get;set;}
        public Partner Partner { get; set; } 

        public decimal Amount { get; set; } 
        public string Currency { get; set; } 
        public string Reason { get; set; } 
        public int StudyID { get; set; } 
        public Study Study { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }



    }
}
