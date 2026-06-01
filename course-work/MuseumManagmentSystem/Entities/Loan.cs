namespace MuseumManagmentSystem.Entities
{
    public class Loan
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; } 
        public int PartnerID { get; set; } 
        public Partner Partner { get; set; } 
        public char LoanType { get; set; } 
        public DateTime StartDate { get; set; } 
        public DateTime EndDate { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
