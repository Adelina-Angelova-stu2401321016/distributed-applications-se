namespace MuseumManagmentSystem.Entities
{
    public class StudyResearcher
    {
        public int ID { get; set; }
        public DateTime DT { get; set; } 
        public int StudyID { get; set; } 
        public Study Study { get; set; }
        public int ResearcherID { get; set; }
        public User Researcher { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
