namespace MuseumManagmentSystem.Entities
{
    public class LoanItem
    {
        public int ID { get; set; }
        public DateTime DT { get; set; } 
        public int LoanID { get; set; } 
        public Loan Loan { get; set; } 
        public int ItemID { get; set; } 
        public Item Item { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
