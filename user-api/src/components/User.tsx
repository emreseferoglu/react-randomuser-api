import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Row,
  Col,
  Card,
  CardText,
  CardTitle,
  CardBody,
  CardImg,
} from "react-bootstrap"; // CSS dosyasını içe aktarın

interface User {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
  };
  photo: string;
}

function User() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean[]>([]); // Kartların yüklendiğini kontrol etmek için

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API HATASI: " + errorData);
          throw new Error(errorData);
        }

        const data: User[] = await response.json();
        console.log(data);

        const userRandomPhoto = await Promise.all(
          data.map(async (user) => {
            const randomResponse = await fetch("https://randomuser.me/api/");
            const randomData = await randomResponse.json();
            const photo = randomData.results[0].picture.large;

            console.log(photo);
            return {
              ...user,
              photo,
            };
          })
        );

        setUsers(userRandomPhoto);
      } catch (err) {
        console.error("Kullanıcılar yüklenirken hata oluştu" + err);
        setError(err || "Bilinmeyen bir hata ile karşılaşıldı");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Kartlar yüklendiğinde visible sınıfını ekle
    const handleScroll = () => {
      const cards = document.querySelectorAll(".card");
      cards.forEach((card, index) => {
        const cardOffset = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (cardOffset < windowHeight) {
          // Kart görünüm alanına girdiyse
          setLoaded((prev) => {
            const newLoaded = [...prev];
            newLoaded[index] = true; // Kartı görünür hale getir
            return newLoaded;
          });
        }
      });
    };

    handleScroll(); // Sayfa yüklendiğinde kartları kontrol et
    window.addEventListener("scroll", handleScroll); // Kaydırıldıkça kontrol et

    return () => {
      window.removeEventListener("scroll", handleScroll); // Temizleme
    };
  }, [users]);

  return (
    <Container>
      <Row>
        {users.map(({ id, name, email, address, photo }, index) => (
          <Col key={id} xs={12} xl={4} lg={6} md={12}>
            <Card className={`card ${loaded[index] ? "visible" : ""}`}>
              <CardImg
                className="randomImage"
                variant="top"
                src={photo}
                width={100}
              ></CardImg>
              <CardBody>
                <CardText>İsim: {name}</CardText>
                <CardText>E-Posta: {email}</CardText>
                <CardText>Adres: {address.street}</CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default User;
